import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Search, Barcode, Box, MoreVertical, Filter } from 'lucide-react-native';

export default function InventoryLookup() {
  const [search, setSearch] = useState('');
  
  const inventory = [
    { sku: 'RAW-COCO-01', name: 'Raw Coconuts', qty: '4,500', unit: 'units', status: 'IN STOCK', category: 'Raw Material' },
    { sku: 'PKG-GLS-250', name: 'Glass Bottle 250ml', qty: '82', unit: 'units', status: 'LOW STOCK', category: 'Packaging' },
    { sku: 'CON-MNG-50L', name: 'Mango Concentrate', qty: '12', unit: 'Drums', status: 'IN STOCK', category: 'Ingredients' },
    { sku: 'LBL-WV-01', name: 'Water Vibe Labels', qty: '1,200', unit: 'Rolls', status: 'IN STOCK', category: 'Marketing' },
  ];

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94a3b8" />
            <TextInput 
              placeholder="Search SKU or name..." 
              style={styles.input} 
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity><Barcode size={22} color="#2563eb" /></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={20} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.smallStat}>
            <Text style={styles.smallStatLabel}>Total Items</Text>
            <Text style={styles.smallStatValue}>{inventory.length}</Text>
          </View>
          <View style={styles.smallStat}>
            <Text style={styles.smallStatLabel}>Low Stock</Text>
            <Text style={[styles.smallStatValue, { color: '#ef4444' }]}>1</Text>
          </View>
        </View>

        {filteredItems.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.itemCard}>
            <View style={[styles.iconBox, { backgroundColor: item.status === 'LOW STOCK' ? '#fef2f2' : '#eff6ff' }]}>
              <Box size={22} color={item.status === 'LOW STOCK' ? '#ef4444' : '#2563eb'} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'LOW STOCK' ? '#fee2e2' : '#f0fdf4' }]}>
                  <Text style={[styles.statusText, { color: item.status === 'LOW STOCK' ? '#ef4444' : '#22c55e' }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.skuText}>{item.sku}</Text>
              
              <View style={styles.qtyRow}>
                <Text style={styles.qtyValue}>{item.qty}</Text>
                <Text style={styles.unitText}>{item.unit}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
              <MoreVertical size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Box color="#fff" size={24} />
        <Text style={styles.fabText}>Add Stock</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 15, height: 50, borderRadius: 16 },
  input: { flex: 1, marginLeft: 10, fontWeight: '700', color: '#0f172a' },
  filterBtn: { width: 50, height: 50, backgroundColor: '#f1f5f9', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  smallStat: { 
    flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 18,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.02)' },
      default: { shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 }
    })
  },
  smallStatLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  smallStatValue: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 4 },
  itemCard: { 
    flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 24, marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.03)' },
      default: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 }
    })
  },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  categoryText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
  nameText: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  skuText: { fontSize: 12, fontWeight: '700', color: '#64748b', marginTop: 1 },
  qtyRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8, gap: 4 },
  qtyValue: { fontSize: 18, fontWeight: '900', color: '#2563eb' },
  unitText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '900' },
  moreBtn: { padding: 4 },
  fab: { 
    position: 'absolute', bottom: 24, right: 24, backgroundColor: '#0f172a', 
    paddingHorizontal: 20, height: 56, borderRadius: 28, flexDirection: 'row', 
    alignItems: 'center', gap: 10,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)' },
      default: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }
    })
  },
  fabText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
