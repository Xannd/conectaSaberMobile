import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert, 
  Modal,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchClasses'>;

interface Oferta {
  id: number;
  disciplina: string;
  dias_disponiveis: string;
  horario_inicio: string;
  horario_fim: string;
  nome_voluntario: string;
}

export default function SearchClassesScreen({ navigation }: Props) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [ofertaSelecionada, setOfertaSelecionada] = useState<Oferta | null>(null);
  const [dataAula, setDataAula] = useState(''); // Formato YYYY-MM-DD

  async function handleSearch() {
    if (!termo.trim()) return;
    setLoading(true);
    try {
      const response = await api.get(`/ofertas/busca?disciplina=${termo}`);
      setResultados(response.data);
      if (response.data.length === 0) Alert.alert('Aviso', 'Nenhuma aula encontrada para essa matéria.');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao buscar aulas.');
    } finally {
      setLoading(false);
    }
  }

  function abrirModalAgendamento(oferta: Oferta) {
    setOfertaSelecionada(oferta);
    setDataAula('');
    setModalVisible(true);
  }

  async function confirmarAgendamento() {
    if (!dataAula || !ofertaSelecionada) {
      return Alert.alert('Erro', 'Por favor, digite a data da aula (AAAA-MM-DD).');
    }
    
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataRegex.test(dataAula)) {
        return Alert.alert('Erro', 'Formato de data inválido. Use AAAA-MM-DD (Ex: 2025-12-20)');
    }

    try {
      await api.post('/agendamentos', {
        id_oferta: ofertaSelecionada.id,
        data_aula: dataAula
      });

      setModalVisible(false);
      Alert.alert('Sucesso!', 'Solicitação enviada ao professor.', [
        { text: 'OK', onPress: () => navigation.goBack() } 
      ]);

    } catch (error: any) {
      const msg = error.response?.data?.erro || 'Erro ao solicitar agendamento.';
      Alert.alert('Ops!', msg);
    }
  }

  const renderItem = ({ item }: { item: Oferta }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.disciplina}>{item.disciplina}</Text>
        <Text style={styles.prof}>Prof. {item.nome_voluntario}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.info}>📅 Dias: {item.dias_disponiveis}</Text>
        <Text style={styles.info}>⏰ Horário: {item.horario_inicio.slice(0,5)} - {item.horario_fim.slice(0,5)}</Text>
      </View>

      <TouchableOpacity style={styles.btnSolicitar} onPress={() => abrirModalAgendamento(item)}>
        <Text style={styles.btnText}>Solicitar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* BARRA DE PESQUISA */}
      <View style={styles.searchBox}>
        <TextInput 
          style={styles.input}
          placeholder="Qual matéria você precisa? (Ex: Mat)"
          value={termo}
          onChangeText={setTermo}
        />
        <TouchableOpacity style={styles.btnSearch} onPress={handleSearch}>
          <Text style={styles.emojiSearch}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE RESULTADOS */}
      {loading ? (
        <ActivityIndicator style={{marginTop: 20}} color="#4F46E5" />
      ) : (
        <FlatList 
          data={resultados}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Digite uma matéria acima para buscar professores.</Text>
          }
        />
      )}

      {/* MODAL DE AGENDAMENTO */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agendar Aula</Text>
            <Text style={styles.modalSub}>
              Com Prof. {ofertaSelecionada?.nome_voluntario}
            </Text>
            <Text style={styles.modalLabel}>Para qual data?</Text>
            
            <TextInput 
              style={styles.inputModal}
              placeholder="AAAA-MM-DD (Ex: 2025-10-20)"
              value={dataAula}
              onChangeText={setDataAula}
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.dica}>* Verifique os dias disponíveis do professor</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.textCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={confirmarAgendamento}>
                <Text style={styles.textConfirm}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  
  // Busca
  searchBox: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12 },
  btnSearch: { backgroundColor: '#4F46E5', width: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  emojiSearch: { fontSize: 20 },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 40 },

  // Card Resultado
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  disciplina: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5' },
  prof: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  cardBody: { marginBottom: 12 },
  info: { color: '#334155', marginBottom: 4 },
  btnSolicitar: { backgroundColor: '#10B981', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 24, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  modalSub: { fontSize: 16, color: '#4F46E5', marginBottom: 20 },
  modalLabel: { fontWeight: '600', marginBottom: 8 },
  inputModal: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 16 },
  dica: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  btnCancel: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
  textCancel: { color: '#EF4444', fontWeight: 'bold' },
  btnConfirm: { flex: 1, backgroundColor: '#4F46E5', padding: 12, borderRadius: 8, alignItems: 'center' },
  textConfirm: { color: '#FFF', fontWeight: 'bold' },
});