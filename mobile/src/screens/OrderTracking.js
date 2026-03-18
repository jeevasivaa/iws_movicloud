import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { Search, Package, MapPin } from 'lucide-react-native';

export default function OrderTracking() {
  const orders = [
    { id: '#ORD-891', status: 'Dispatched', destination: 'Mumbai Central', time: '2h ago' },
    { id: '#ORD-892', status: 'In Transit', destination: 'Pune Hub', time: '4h ago' },
    { id: '#ORD-890', status: 'Delivered', destination: 'South Delhi', time: 'Yesterday' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Search size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput placeholder="Track Order ID..." style={styles.input} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.row}>
              <Package size={20} color="#2563eb" />
              <Text style={styles.orderId}>{item.id}</Text>
              <View style={styles.statusChip}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={14} color="#64748b" />
              <Text style={styles.locationText}>{item.destination}</Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, paddingHorizontal: 15, borderRadius: 16, borderWith: 1, borderColor: '#e2e8f0' },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontWeight: '600' },
  orderCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginLeft: 10, flex: 1 },
  statusChip: { backgroundColor: '#f0f9ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '900', color: '#0369a1' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { fontSize: 13, fontWeight: '600', color: '#64748b', marginLeft: 5 },
  timeText: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
});
