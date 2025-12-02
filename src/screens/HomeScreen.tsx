import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface Agendamento {
  id_agendamento: number;
  data_aula: string;
  horario_inicio: string;
  horario_fim: string;
  disciplina: string;
  nome_aluno?: string;    
  nome_voluntario?: string;
}

interface Usuario {
  nome: string;
  tipo_perfil: 'ALUNO' | 'VOLUNTARIO' | 'GESTOR';
}

export default function HomeScreen({ navigation }: Props) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [agenda, setAgenda] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Função que carrega tudo
  const loadData = useCallback(async () => {
    try {
      const userJson = await AsyncStorage.getItem('usuario');
      if (userJson) setUsuario(JSON.parse(userJson));

      const response = await api.get('/agendamentos/agenda');
      setAgenda(response.data);

    } catch (error) {
      console.error("Erro ao carregar home", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleLogout() {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  const renderItem = ({ item }: { item: Agendamento }) => (
    <View style={styles.card}>
      <View style={styles.dateBox}>
        <Text style={styles.day}>{new Date(item.data_aula).getDate()}</Text>
        <Text style={styles.month}>
          {new Date(item.data_aula).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.subject}>{item.disciplina}</Text>
        <Text style={styles.time}>
           ⏰ {item.horario_inicio.slice(0,5)} - {item.horario_fim.slice(0,5)}
        </Text>
        <Text style={styles.person}>
          {usuario?.tipo_perfil === 'VOLUNTARIO' 
            ? `Aluno: ${item.nome_aluno}` 
            : `Prof: ${item.nome_voluntario}`}
        </Text>
      </View>

      <View style={styles.statusIndicator} />
    </View>
  );

  return (
    <View style={styles.container}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
            <View>
            <Text style={styles.greeting}>Olá, {usuario?.nome.split(' ')[0]}</Text>
            <Text style={styles.roleLabel}>
                {usuario?.tipo_perfil === 'ALUNO' ? '🎓 Área do Aluno' : '🤝 Área do Voluntário'}
            </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
        </View>

        {/* BOTÕES DE AÇÃO PRINCIPAL */}
        <View style={styles.actionContainer}>
          {usuario?.tipo_perfil === 'ALUNO' ? (
            <TouchableOpacity 
                style={styles.mainButton}
                onPress={() => navigation.navigate('SearchClasses')}
            >
              <Text style={styles.mainButtonText}>🔍 Buscar Novas Aulas</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ gap: 12 }}> 
              <TouchableOpacity 
                style={styles.mainButton}
                onPress={() => navigation.navigate('Requests')}
              >
                <Text style={styles.mainButtonText}>🔔 Ver Solicitações</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.mainButton, { backgroundColor: '#0EA5E9' }]} // Cor Azul Claro para diferenciar
                onPress={() => navigation.navigate('CreateOffer')} // <--- NAVEGA PARA CRIAR OFERTA
              >
                <Text style={styles.mainButtonText}>➕ Cadastrar Nova Aula</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.mainButton, { backgroundColor: '#475569' }]}
                onPress={() => navigation.navigate('MyOffers')}
              >
                <Text style={styles.mainButtonText}>📋 Gerenciar Minhas Ofertas</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Minhas Aulas Confirmadas</Text>

        {/* LISTA DE AULAS */}
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={agenda}
            keyExtractor={(item) => String(item.id_agendamento)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
            }
            ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhuma aula agendada no momento.</Text>
            }
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  roleLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  logoutBtn: { padding: 8 },
  logoutText: { color: '#EF4444', fontWeight: '600' },

  actionContainer: { marginBottom: 24 },
  mainButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  mainButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 20, fontStyle: 'italic' },

  // Card Styles
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dateBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginRight: 16,
  },
  day: { fontSize: 20, fontWeight: 'bold', color: '#4F46E5' },
  month: { fontSize: 12, fontWeight: 'bold', color: '#4F46E5' },
  
  cardInfo: { flex: 1 },
  subject: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  time: { fontSize: 13, color: '#64748B', marginTop: 4 },
  person: { fontSize: 13, color: '#64748B', marginTop: 2 },

  statusIndicator: {
    width: 4,
    height: '80%',
    backgroundColor: '#10B981', // Verde
    borderRadius: 2,
    marginLeft: 12,
  },
});