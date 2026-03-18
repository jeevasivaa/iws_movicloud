import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Search, Package, MapPin, ChevronRight, Clock, ArrowRight } from 'lucide-react-native';

export default function OrderTracking() {
  const orders = [
    { id: '#ORD-891', status: 'Dispatched', destination: 'Mumbai Central', time: '2h ago', items: 12, value: '₹14,200' },
    { id: '#ORD-892', status: 'In Transit', destination: 'Pune Hub', time: '4h ago', items: 8, value: '₹9,800' },
    { id: '#ORD-890', status: 'Delivered', destination: 'South Delhi', time: 'Yesterday', items: 24, value: '₹28,500' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Dispatched': return '#8b5cf6';
      case 'In Transit': return '#2563eb';
      case 'Delivered': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Search size={20} color="#94a3b8" />
          <TextInput placeholder="Track Order ID or City..." style={styles.input} />
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard}>
            <View style={styles.cardTop}>
              <View style={styles.idGroup}>
                <View style={[styles.iconBox, { backgroundColor: `${getStatusColor(item.status)}10` }]}>
                  <Package size={22} color={getStatusColor(item.status)} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <View style={styles.timeRow}>
                    <Clock size={12} color="#94a3b8" />
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusChip, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.locationPoint} />
              <View style={styles.locationLine} />
              <View style={[styles.locationPoint, { backgroundColor: '#2563eb' }]} />
              
              <View style={styles.locationDetails}>
                <Text style={styles.destinationLabel}>Origin: Factory Node 1</Text>
                <View style={styles.destinationRow}>
                  <MapPin size={14} color="#2563eb" />
                  <Text style={styles.destinationText}>{item.destination}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.footerInfo}>
                <Text style={styles.footerLabel}>Items</Text>
                <Text style={styles.footerValue}>{item.items}</Text>
              </View>
              <View style={styles.footerInfo}>
                <Text style={styles.footerLabel}>Value</Text>
                <Text style={styles.footerValue}>{item.value}</Text>
              </View>
              <TouchableOpacity style={styles.detailsBtn}>
                <Text style={styles.detailsBtnText}>Details</Text>
                <ArrowRight size={14} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 15, height: 50, borderRadius: 16 },
  input: { flex: 1, marginLeft: 10, fontWeight: '700', color: '#0f172a' },
  orderCard: { 
    backgroundColor: '#fff', borderRadius: 24, marginBottom: 16, padding: 20,
    ...Platform.select({
      web: { boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.03)' },
      default: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 }
    })
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  idGroup: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  orderId: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  timeText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '900' },
  locationContainer: { flexDirection: 'row', marginLeft: 24, marginBottom: 20 },
  locationPoint: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#cbd5e1', zIndex: 1 },
  locationLine: { position: 'absolute', left: 3, top: 8, bottom: -8, width: 2, backgroundColor: '#f1f5f9' },
  locationDetails: { marginLeft: 20, marginTop: -4 },
  destinationLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  destinationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
  destinationText: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16, marginTop: 4 },
  footerInfo: { flex: 1 },
  footerLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  footerValue: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginTop: 2 },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  detailsBtnText: { color: '#2563eb', fontWeight: '900', fontSize: 13 },
});
