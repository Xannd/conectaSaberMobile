import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cria a instância do Axios
const api = axios.create({
    // Graças ao 'adb reverse', o Android entende localhost como sendo o seu PC
    baseURL: 'https://conecta-saber-backend.onrender.com/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Antes de cada requisição, insere o Token automaticamente
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            return config;
        } catch (error) {
            console.error("Erro ao recuperar token", error);
            return config;
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;