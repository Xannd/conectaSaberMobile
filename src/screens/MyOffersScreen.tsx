import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import api from '../services/api';

interface Oferta {
  id: number;
  disciplina: string;
  dias_disponiveis: string;
  horario_inicio: string;
  horario_fim: string;
}

export default function MyOffersScreen() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOffers = useCallback(async () => {
    try {
      const response = await api.get('/ofertas/meus-registros');
      setOfertas(response.data);
    } catch (error) {
      console.error("Erro ao buscar ofertas", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const renderItem = ({ item }: { item: Oferta }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.subject}>{item.disciplina}</Text>
        <Text style={styles.statusBadge}>Ativa</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>📅 Dias:</Text>
        <Text style={styles.value}>{item.dias_disponiveis}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>⏰ Horário:</Text>
        <Text style={styles.value}>
          {item.horario_inicio.slice(0,5)} às {item.horario_fim.slice(0,5)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
      ) : (
        <FlatList 
          data={ofertas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOffers(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Você ainda não cadastrou aulas.</Text>
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
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subject: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  statusBadge: { backgroundColor: '#D1FAE5', color: '#065F46', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 12, fontWeight: 'bold' },
  
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { fontWeight: '600', color: '#64748B', width: 80 },
  value: { color: '#334155', flex: 1 },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94A3B8', fontStyle: 'italic' }
});