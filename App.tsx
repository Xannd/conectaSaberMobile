import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchClassesScreen from './src/screens/SearchClassesScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CreateOfferScreen from './src/screens/CreateOfferScreen';
import MyOffersScreen from './src/screens/MyOffersScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
  <NavigationContainer>
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: '#4F46E5' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Minha Agenda', headerBackVisible: false }} 
      />

      <Stack.Screen 
        name="SearchClasses" 
        component={SearchClassesScreen} 
        options={{ title: 'Buscar Aulas' }} 
      />

      <Stack.Screen 
        name="Requests" 
        component={RequestsScreen} 
        options={{ title: 'Solicitações Pendentes' }} 
      />

      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Criar Conta' }}
      />

      <Stack.Screen 
        name="CreateOffer" 
        component={CreateOfferScreen} 
        options={{ title: 'Cadastrar Aula' }} 
      />
      
      <Stack.Screen 
        name="MyOffers" 
        component={MyOffersScreen} 
        options={{ title: 'Minhas aulas cadastradas' }} 
      />
    </Stack.Navigator>
  </NavigationContainer>
  );
}