import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Bell, AlertCircle, Info, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react-native';

export default function Notifications() {
  const alerts = [
    { type: 'critical', title: 'Low Stock Warning', msg: 'Glass Bottles (250ml) dropped below 100 units.', time: '10m ago', read: false },
    { type: 'info', title: 'New Production Batch', msg: 'Batch #TCW-884 has been approved by admin.', time: '1h ago', read: true },
    { type: 'ai', title: 'AI Prediction', msg: 'Expected demand spike for Coconut Water next week.', time: '3h ago', read: false },
    { type: 'success', title: 'Quality Check Passed', msg: 'Batch #TCW-882 cleared all safety parameters.', time: '5h ago', read: true },
  ];

  const getAlertConfig = (type) => {
    switch (type) {
      case 'critical': return { icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' };
      case 'ai': return { icon: Sparkles, color: '#8b5cf6', bg: '#f5f3ff' };
      case 'success': return { icon: CheckCircle2, color: '#10b981', bg: '#f0fdf4' };
      default: return { icon: Info, color: '#2563eb', bg: '#eff6ff' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts & Activity</Text>
        <TouchableOpacity><Text style={styles.markRead}>Mark all read</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {alerts.map((alert, idx) => {
          const config = getAlertConfig(alert.type);
          return (
            <TouchableOpacity key={idx} style={[styles.alertCard, !alert.read && styles.unreadCard]}>
              <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                <config.icon size={22} color={config.color} />
              </View>
              
              <View style={styles.alertContent}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  {!alert.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.alertMsg}>{alert.msg}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>

              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  markRead: { fontSize: 13, fontWeight: '800', color: '#2563eb' },
  scrollContent: { padding: 16 },
  alertCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 24, marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)' },
      default: { shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 }
    })
  },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  alertContent: { flex: 1, marginLeft: 16, marginRight: 8 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  alertTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb' },
  alertMsg: { fontSize: 13, color: '#64748b', fontWeight: '600', lineHeight: 18 },
  alertTime: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginTop: 6 },
});
