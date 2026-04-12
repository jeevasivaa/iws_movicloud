import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Factory, LogIn, ShieldCheck, Database, LayoutDashboard, Truck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'admin', label: 'Admin', icon: ShieldCheck, color: '#2563eb' },
  { id: 'operations', label: 'Operations', icon: Factory, color: '#8b5cf6' },
  { id: 'finance', label: 'Finance', icon: Database, color: '#f59e0b' },
  { id: 'client', label: 'Client', icon: Truck, color: '#10b981' },
];

export default function AuthFlowMobile() {
  const { loginAsMockUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Factory color="#fff" size={32} strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>VSA BEVERAGES</Text>
          <Text style={styles.subtitle}>IWS Mobile Terminal</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Secure Access</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Corporate Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="name@vsabeverages.com" 
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input} 
              placeholder="••••••••" 
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.loginBtn}>
            <LogIn color="#fff" size={20} strokeWidth={2.5} />
            <Text style={styles.loginBtnText}>Authorize Terminal</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.demoTitle}>Quick Demo Login (Select Role)</Text>
        <View style={styles.roleGrid}>
          {ROLES.map((role) => (
            <TouchableOpacity 
              key={role.id} 
              style={[styles.roleCard, { borderColor: `${role.color}20` }]}
              onPress={() => loginAsMockUser(role.id)}
            >
              <View style={[styles.roleIcon, { backgroundColor: `${role.color}10` }]}>
                <role.icon color={role.color} size={24} />
              </View>
              <Text style={styles.roleLabel}>{role.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>© 2026 VSA Beverages IWS • Security Node 882</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { 
    width: 64, height: 64, backgroundColor: '#2563eb', borderRadius: 20, 
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(37, 99, 235, 0.3)' },
      default: { shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }
    })
  },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginTop: 16, letterSpacing: -1 },
  subtitle: { fontSize: 12, fontWeight: '900', color: '#2563eb', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 },
  formCard: { 
    backgroundColor: '#fff', padding: 24, borderRadius: 24,
    ...Platform.select({
      web: { boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.05)' },
      default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 }
    })
  },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#f1f5f9', height: 54, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, fontWeight: '600', color: '#0f172a' },
  loginBtn: { 
    backgroundColor: '#2563eb', height: 54, borderRadius: 12, flexDirection: 'row', 
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(37, 99, 235, 0.4)' },
      default: { shadowColor: '#2563eb', shadowOpacity: 0.4, shadowRadius: 10, elevation: 4 }
    })
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', marginLeft: 10 },
  demoTitle: { fontSize: 12, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 40, marginBottom: 16, textAlign: 'center' },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  roleCard: { width: '47%', backgroundColor: '#fff', padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  roleIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  roleLabel: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 10, fontWeight: '800', marginTop: 40, textTransform: 'uppercase', letterSpacing: 1 },
});
