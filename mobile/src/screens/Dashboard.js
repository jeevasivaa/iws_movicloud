import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Package, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  
  const stats = [
    { label: 'Active Batches', value: '12', icon: Activity, color: '#2563eb' },
    { label: 'Pending Orders', value: '4', icon: Package, color: '#8b5cf6' },
    { label: 'Low Stock', value: '3', icon: AlertTriangle, color: '#f59e0b' },
    { label: 'QC Passed', value: '28', icon: CheckCircle2, color: '#10b981' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.greeting}>Welcome, {user?.name || 'Guest'}</Text>
        <Text style={styles.subtitle}>{user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Overview` : 'Daily Operational Overview'}</Text>

        <View style={styles.grid}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon color={stat.color} size={24} strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Production</Text>
        <View style={styles.recentItem}>
          <Text style={styles.batchId}>#TCW-882</Text>
          <Text style={styles.batchName}>Coconut Water (Glass)</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>IN QC</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  greeting: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginTop: 20 },
  subtitle: { fontSize: 14, color: '#64748b', fontWeight: '600', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: '#fff', padding: 16, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 4 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 30, marginBottom: 15 },
  recentItem: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  batchId: { fontSize: 13, fontWeight: '900', color: '#2563eb' },
  batchName: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  badge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#2563eb' },
});
