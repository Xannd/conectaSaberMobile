import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOffer'>;

export default function CreateOfferScreen({ navigation }: Props) {
  const [disciplina, setDisciplina] = useState('');
  const [dias, setDias] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!disciplina || !dias || !inicio || !fim) {
      return Alert.alert('Erro', 'Preencha todos os campos.');
    }

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(inicio) || !timeRegex.test(fim)) {
        return Alert.alert('Erro', 'Use o formato HH:mm para os horários (Ex: 14:00).');
    }

    setLoading(true);

    try {
      await api.post('/ofertas', {
        disciplina,
        dias_disponiveis: dias,
        horario_inicio: inicio,
        horario_fim: fim
      });

      Alert.alert('Sucesso', 'Sua disponibilidade foi cadastrada! Agora os alunos podem te encontrar.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.erro || 'Erro ao cadastrar oferta.';
        Alert.alert('Atenção', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nova Oferta de Aula</Text>
      <Text style={styles.subtitle}>O que você vai ensinar?</Text>

      <Text style={styles.label}>Disciplina</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ex: Matemática, Inglês..." 
        placeholderTextColor="#94A3B8"
        value={disciplina} 
        onChangeText={setDisciplina} 
      />

      <Text style={styles.label}>Dias Disponíveis</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ex: Segunda e Quarta" 
        placeholderTextColor="#94A3B8"
        value={dias} 
        onChangeText={setDias} 
      />

      <View style={styles.row}>
        <View style={styles.col}>
            <Text style={styles.label}>Início (HH:mm)</Text>
            <TextInput 
                style={styles.input} 
                placeholder="14:00" 
                placeholderTextColor="#94A3B8"
                value={inicio} 
                onChangeText={setInicio} 
                keyboardType="numbers-and-punctuation"
                maxLength={5}
            />
        </View>
        <View style={styles.col}>
            <Text style={styles.label}>Fim (HH:mm)</Text>
            <TextInput 
                style={styles.input} 
                placeholder="16:00" 
                placeholderTextColor="#94A3B8"
                value={fim} 
                onChangeText={setFim} 
                keyboardType="numbers-and-punctuation"
                maxLength={5}
            />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar Disponibilidade</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 32 },
  
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, marginBottom: 16, color: '#1E293B' },
  
  row: { flexDirection: 'row', gap: 16 },
  col: { flex: 1 },

  button: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});