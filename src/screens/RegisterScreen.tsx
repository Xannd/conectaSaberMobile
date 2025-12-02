import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  
  const [tipoPerfil, setTipoPerfil] = useState<'ALUNO' | 'VOLUNTARIO'>('ALUNO');
  
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome || !email || !senha || !telefone) {
      return Alert.alert('Atenção', 'Preencha todos os campos.');
    }

    setLoading(true);

    try {
      await api.post('/usuarios/registro', {
        nome,
        email,
        senha,
        telefone,
        tipo_perfil: tipoPerfil,
        id_escola: null 
      });

      Alert.alert(
        'Conta Criada!',
        'Seu cadastro foi realizado com sucesso. Faça login para continuar.',
        [
          { text: 'OK', onPress: () => navigation.goBack() } // Volta para o Login
        ]
      );

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.erro || 'Não foi possível criar a conta.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Junte-se ao Conecta Saber</Text>

        {/* --- SELETOR DE PERFIL --- */}
        <View style={styles.profileSelector}>
            <TouchableOpacity 
            style={[styles.profileOption, tipoPerfil === 'ALUNO' && styles.profileSelected]}
            onPress={() => setTipoPerfil('ALUNO')}
            >
            <Text style={[styles.profileText, tipoPerfil === 'ALUNO' && styles.textSelected]}>Sou Aluno</Text>
            </TouchableOpacity>

            <TouchableOpacity 
            style={[styles.profileOption, tipoPerfil === 'VOLUNTARIO' && styles.profileSelected]}
            onPress={() => setTipoPerfil('VOLUNTARIO')}
            >
            <Text style={[styles.profileText, tipoPerfil === 'VOLUNTARIO' && styles.textSelected]}>Sou Voluntário</Text>
            </TouchableOpacity>
        </View>

        {/* --- FORMULÁRIO --- */}
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput 
            style={styles.input} 
            value={nome} 
            onChangeText={setNome} 
            placeholder="Seu nome" 
            placeholderTextColor="#6b6a6aff"
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            placeholder="seu@email.com" 
            placeholderTextColor="#6b6a6aff"
            keyboardType="email-address" 
            autoCapitalize="none"
        />

        <Text style={styles.label}>Telefone (Whatsapp)</Text>
        <TextInput 
            style={styles.input} 
            value={telefone} 
            onChangeText={setTelefone} 
            placeholder="(XX) 99999-9999" 
            keyboardType="phone-pad" 
            placeholderTextColor="#6b6a6aff"

        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
            style={[styles.input, { color: '#000000' }]}
            value={senha} 
            onChangeText={setSenha} 
            placeholder="Crie uma senha segura" 
            secureTextEntry 
            placeholderTextColor="#6b6a6aff"

        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Já tenho conta? Fazer Login</Text>
        </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4F46E5', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  
  button: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#4F46E5', fontWeight: '500' },

  // Estilos do Seletor
  profileSelector: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 8, padding: 4, marginBottom: 24 },
  profileOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  profileSelected: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.1, elevation: 2 },
  profileText: { fontWeight: '600', color: '#64748B' },
  textSelected: { color: '#4F46E5' },
});