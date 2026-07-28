// ─────────────────────────────────────────────
//  Navigation — App Navigator (React Navigation)
// ─────────────────────────────────────────────
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {Colors} from '../utils/theme';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import WalletScreen from '../screens/WalletScreen';
import ReportScreen from '../screens/ReportScreen';
import CategoryScreen from '../screens/CategoryScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';

export type RootStackParamList = {
  Dashboard: undefined;
  AddTransaction: {editId?: number} | undefined;
  Wallet: {action?: 'add'} | undefined;
  Report: undefined;
  Category: undefined;
  TransactionDetail: {transactionId: number};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: Colors.bg},
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Dashboard"   component={DashboardScreen} />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="Wallet"      component={WalletScreen} />
        <Stack.Screen name="Report"      component={ReportScreen} />
        <Stack.Screen name="Category"    component={CategoryScreen} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
