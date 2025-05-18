// src/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from '../screens/main/MainScreen';
import WriteScreen from '../screens/main/WriteScreen';
import AnalyzeScreen from '../screens/main/AnalyzeScreen';

export type AppStackParamList = {
  Main: undefined;
  Write: undefined;
  Analyze: { postId: string }; // 분석 화면은 글 ID를 받아서 열도록 설계
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Write" component={WriteScreen} />
      <Stack.Screen name="Analyze" component={AnalyzeScreen} />
    </Stack.Navigator>
  );
}
