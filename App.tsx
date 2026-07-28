/**
 * App Entry Point — Offline Pencatatan Keuangan (Expo)
 * React Native + TypeScript
 */
import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {enableScreens} from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
import getDB from './src/database/db';
import {Text, View} from 'react-native';
import {Colors} from './src/utils/theme';

// Must be called before NavigationContainer renders
enableScreens();

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  // Initialize DB on first render
  useEffect(() => {
    try {
      getDB();
      setIsReady(true);
    } catch (e) {
      console.error('[DB] Init failed:', e);
    }
  }, []);

  if (!isReady) {
    return (
      <View style={{flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: Colors.textSecondary}}>Loading Database...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
};

export default App;
