import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Requests'>;

interface Solicitacao {
  id_agendamento: number;
  data_aula: string;
  nome_aluno: string;
  disciplina: string;
}

export default function RequestsScreen({ navigation }: Props) {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      const response = await api.get('/agendamentos/pendentes');
      setSolicitacoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Função de Responder (Aceitar/Recusar)
  async function handleResponse(id: number, status: 'CONFIRMADO' | 'CANCELADO') {
    try {
      await api.patch(`/agendamentos/${id}/responder`, {
        novo_status: status
      });

      Alert.alert(
        status === 'CONFIRMADO' ? 'Sucesso!' : 'Recusado',
        status === 'CONFIRMADO' ? 'Aula confirmada na sua agenda.' : 'Solicitação removida.'
      );
      
      setLoading(true);
      loadRequests();

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar a ação.');
    }
  }

  const renderItem = ({ item }: { item: Solicitacao }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.subject}>{item.disciplina}</Text>
        <Text style={styles.date}>{new Date(item.data_aula).toLocaleDateString()}</Text>
      </View>
      
      <Text style={styles.student}>Aluno: {item.nome_aluno}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.btn, styles.btnReject]} 
          onPress={() => handleResponse(item.id_agendamento, 'CANCELADO')}
        >
          <Text style={styles.textReject}>Recusar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.btnAccept]} 
          onPress={() => handleResponse(item.id_agendamento, 'CONFIRMADO')}
        >
          <Text style={styles.textAccept}>Aceitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
      ) : (
        <FlatList 
          data={solicitacoes}
          keyExtractor={item => String(item.id_agendamento)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRequests(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma solicitação pendente.</Text>
              <Text style={styles.emptySub}>Você está em dia! 🎉</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B' 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  subject: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  date: { fontSize: 16, color: '#4F46E5', fontWeight: 'bold' },
  student: { fontSize: 15, color: '#64748B', marginBottom: 16 },
  
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnReject: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444' },
  btnAccept: { backgroundColor: '#10B981' }, 
  
  textReject: { color: '#EF4444', fontWeight: 'bold' },
  textAccept: { color: '#FFF', fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, color: '#334155', fontWeight: 'bold' },
  emptySub: { color: '#64748B', marginTop: 8 }
});