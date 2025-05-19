// src/navigation/RootNavigator.tsx
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { AuthContext } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function RootNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    // 토큰 로딩 중일 때 스플래시나 로딩 화면
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
