import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { 
  Package, Activity, AlertTriangle, CheckCircle2, 
  PlusCircle, QrCode, History, ArrowUpRight 
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { user } = useAuth();
  
  const stats = [
    { label: 'Active Batches', value: '12', icon: Activity, color: '#2563eb' },
    { label: 'Pending Orders', value: '4', icon: Package, color: '#8b5cf6' },
    { label: 'Low Stock', value: '3', icon: AlertTriangle, color: '#f59e0b' },
    { label: 'QC Passed', value: '28', icon: CheckCircle2, color: '#10b981' },
  ];

  const quickActions = [
    { label: 'Scan Stock', icon: QrCode, color: '#2563eb' },
    { label: 'New Batch', icon: PlusCircle, color: '#10b981' },
    { label: 'Reports', icon: History, color: '#64748b' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Guest'}</Text>
            <Text style={styles.subtitle}>{user?.role?.toUpperCase()} TERMINAL</Text>
          </View>
          <TouchableOpacity style={styles.profileBadge}>
            <Text style={styles.profileInitial}>{user?.name?.[0] || 'G'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.grid}>
          {stats.map((stat, idx) => (
            <TouchableOpacity key={idx} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: `${stat.color}10` }]}>
                <stat.icon color={stat.color} size={22} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              <ArrowUpRight size={14} color="#cbd5e1" style={styles.cardArrow} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionRow}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <action.icon color="#fff" size={24} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Production</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        
        <View style={styles.recentItem}>
          <View style={styles.recentIconBox}>
            <Activity color="#2563eb" size={20} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.batchName}>Coconut Water (Glass)</Text>
            <Text style={styles.batchId}>Batch #TCW-882 • 250ml</Text>
          </View>
          <View style={styles.badge}><Text style={styles.badgeText}>IN QC</Text></View>
        </View>

        <View style={[styles.recentItem, { marginTop: 12 }]}>
          <View style={[styles.recentIconBox, { backgroundColor: '#f0fdf4' }]}>
            <CheckCircle2 color="#10b981" size={20} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.batchName}>Mango Fusion</Text>
            <Text style={styles.batchId}>Batch #TMF-102 • 500ml</Text>
          </View>
          <View style={styles.badgeSuccess}><Text style={styles.badgeTextSuccess}>COMPLETED</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 11, color: '#2563eb', fontWeight: '900', letterSpacing: 1.5, marginTop: 2 },
  profileBadge: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#e2e8f0', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' 
  },
  profileInitial: { fontSize: 18, fontWeight: '900', color: '#475569' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: width * 0.43, backgroundColor: '#fff', padding: 18, borderRadius: 24, 
    marginBottom: 15, position: 'relative',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)' },
      default: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 }
    })
  },
  cardArrow: { position: 'absolute', top: 15, right: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginTop: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 10, marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 },
  seeAll: { fontSize: 13, fontWeight: '800', color: '#2563eb' },
  actionRow: { marginHorizontal: -20, paddingHorizontal: 20 },
  actionBtn: { alignItems: 'center', marginRight: 20 },
  actionIcon: { 
    width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' },
      default: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }
    })
  },
  actionLabel: { fontSize: 12, fontWeight: '800', color: '#475569', marginTop: 8 },
  recentItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 20,
    ...Platform.select({
      web: { boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.03)' },
      default: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 }
    })
  },
  recentIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  batchId: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginTop: 2 },
  batchName: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  badge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeSuccess: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#2563eb' },
  badgeTextSuccess: { fontSize: 10, fontWeight: '900', color: '#10b981' },
});
