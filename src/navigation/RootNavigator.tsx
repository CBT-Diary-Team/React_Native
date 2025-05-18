// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

// 임시 로그인 여부 (나중엔 AsyncStorage나 Context로 대체)
const isLoggedIn = false;

export default function RootNavigator() {
  return (
    <NavigationContainer>
      {!isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
