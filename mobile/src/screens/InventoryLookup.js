import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Search, Barcode, Box } from 'lucide-react-native';

export default function InventoryLookup() {
  const inventory = [
    { sku: 'RAW-COCO-01', name: 'Raw Coconuts', qty: '4,500 units', status: 'IN STOCK' },
    { sku: 'PKG-GLS-250', name: 'Glass Bottle 250ml', qty: '82 units', status: 'LOW STOCK' },
    { sku: 'CON-MNG-50L', name: 'Mango Concentrate', qty: '12 Drums', status: 'IN STOCK' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94a3b8" />
          <TextInput placeholder="Scan SKU or Search..." style={styles.input} />
          <Barcode size={24} color="#2563eb" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {inventory.map((item, idx) => (
          <View key={idx} style={styles.itemCard}>
            <View style={styles.iconBox}>
              <Box size={20} color="#2563eb" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.skuText}>{item.sku}</Text>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.qtyText}>{item.qty}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'LOW STOCK' ? '#fef2f2' : '#f0fdf4' }]}>
              <Text style={[styles.statusText, { color: item.status === 'LOW STOCK' ? '#ef4444' : '#22c55e' }]}>{item.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 15, height: 54, borderRadius: 16 },
  input: { flex: 1, marginLeft: 10, fontWeight: '700' },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 20, marginBottom: 12 },
  iconBox: { width: 44, height: 44, backgroundColor: '#eff6ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  skuText: { fontSize: 11, fontWeight: '900', color: '#2563eb' },
  nameText: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginVertical: 2 },
  qtyText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
});
