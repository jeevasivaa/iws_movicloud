import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Bell, AlertCircle, Info } from 'lucide-react-native';

export default function Notifications() {
  const alerts = [
    { type: 'critical', title: 'Low Stock Warning', msg: 'Glass Bottles (250ml) dropped below 100 units.', time: '10m ago' },
    { type: 'info', title: 'New Production Batch', msg: 'Batch #TCW-884 has been approved by admin.', time: '1h ago' },
    { type: 'ai', title: 'AI Prediction', msg: 'Expected demand spike for Coconut Water next week.', time: '3h ago' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {alerts.map((alert, idx) => (
        <View key={idx} style={[styles.alertCard, alert.type === 'critical' && styles.criticalBorder]}>
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: alert.type === 'critical' ? '#fee2e2' : '#eff6ff' }]}>
              {alert.type === 'critical' ? <AlertCircle size={20} color="#ef4444" /> : <Info size={20} color="#2563eb" />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
          </View>
          <Text style={styles.alertMsg}>{alert.msg}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  alertCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 15, borderLeftWidth: 1, borderTopWidth: 1, borderColor: '#e2e8f0' },
  criticalBorder: { borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  alertTime: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  alertMsg: { fontSize: 13, color: '#64748b', fontWeight: '600', lineHeight: 20 },
});
