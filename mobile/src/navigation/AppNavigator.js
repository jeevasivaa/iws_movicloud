import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  LayoutDashboard, Truck, Warehouse, Bell, Users, Package2, Handshake, 
  Factory, CreditCard, FileText, Sparkles, Settings, LogOut, ShieldCheck 
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

// Screens
import Dashboard from '../screens/Dashboard';
import OrderTracking from '../screens/OrderTracking';
import InventoryLookup from '../screens/InventoryLookup';
import Notifications from '../screens/Notifications';
import AuthFlowMobile from '../screens/AuthFlowMobile';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function CustomDrawerContent(props) {
  const { user, logout } = useAuth();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>V</Text>
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={{ flex: 1, marginTop: 10 }}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.drawerFooter}>
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => <LogOut color="#ef4444" size={size} />}
          labelStyle={{ color: '#ef4444', fontWeight: 'bold' }}
          onPress={() => logout()}
        />
      </View>
    </DrawerContentScrollView>
  );
}

function MainDrawer() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '900', color: '#0f172a' },
        drawerActiveBackgroundColor: '#eff6ff',
        drawerActiveTintColor: '#2563eb',
        drawerLabelStyle: { fontWeight: 'bold', fontSize: 13 },
        drawerItemStyle: { borderRadius: 12, marginHorizontal: 8, marginVertical: 2 },
      }}
    >
      {/* Admin Only */}
      {role === 'admin' && (
        <>
          <Drawer.Screen 
            name="Admin Dashboard" 
            component={Dashboard} 
            options={{ drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} 
          />
          <Drawer.Screen 
            name="Employees" 
            component={Dashboard} 
            options={{ drawerIcon: ({ color, size }) => <Users color={color} size={size} /> }} 
          />
          <Drawer.Screen 
            name="Products" 
            component={Dashboard} 
            options={{ drawerIcon: ({ color, size }) => <Package2 color={color} size={size} /> }} 
          />
          <Drawer.Screen 
            name="Suppliers" 
            component={Dashboard} 
            options={{ drawerIcon: ({ color, size }) => <Truck color={color} size={size} /> }} 
          />
          <Drawer.Screen 
            name="Clients" 
            component={Dashboard} 
            options={{ drawerIcon: ({ color, size }) => <Handshake color={color} size={size} /> }} 
          />
        </>
      )}

      {/* Operations / Admin */}
      {(role === 'admin' || role === 'operations') && (
        <>
          <Drawer.Screen 
            name="Production" 
            component={Dashboard} 
            options={{ drawerIcon: ({ color, size }) => <Factory color={color} size={size} /> }} 
          />
          <Drawer.Screen 
            name="Inventory" 
            component={InventoryLookup} 
            options={{ drawerIcon: ({ color, size }) => <Warehouse color={color} size={size} /> }} 
          />
        </>
      )}

      {/* Finance / Admin */}
      {(role === 'admin' || role === 'finance') && (
        <>
          <Drawer.Screen 
            name="Billing" 
            component={Dashboard} 
            options={{ drawerIcon: ({ color, size }) => <CreditCard color={color} size={size} /> }} 
          />
          <Drawer.Screen 
            name="Invoices" 
            component={Dashboard} 
            options={{ drawerIcon: ({ color, size }) => <FileText color={color} size={size} /> }} 
          />
        </>
      )}

      {/* Client Only */}
      {role === 'client' && (
        <>
          <Drawer.Screen 
            name="My Orders" 
            component={OrderTracking} 
            options={{ drawerIcon: ({ color, size }) => <Truck color={color} size={size} /> }} 
          />
          <Drawer.Screen 
            name="Product Builder" 
            component={Dashboard} 
            options={{ drawerIcon: ({ color, size }) => <Sparkles color={color} size={size} /> }} 
          />
        </>
      )}

      {/* Shared */}
      <Drawer.Screen 
        name="Notifications" 
        component={Notifications} 
        options={{ drawerIcon: ({ color, size }) => <Bell color={color} size={size} /> }} 
      />
      <Drawer.Screen 
        name="Settings" 
        component={Dashboard} 
        options={{ drawerIcon: ({ color, size }) => <Settings color={color} size={size} /> }} 
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthFlowMobile} />
      ) : (
        <Stack.Screen name="Main" component={MainDrawer} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingTop: 60 },
  logoContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  userName: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  userRole: { fontSize: 10, fontWeight: '900', color: '#2563eb', tracking: 1, marginTop: 2 },
  drawerFooter: { padding: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
});
