import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/auth/SignInScreen';
import SignupScreen from '../screens/auth/SignupScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const { user } = useContext(AuthContext);
  // user가 없거나 이메일 인증되지 않은 경우 VerifyEmail을 초기 화면으로
  const initialRouteName: keyof AuthStackParamList ='SignIn';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignIn" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignupScreen} />
    </Stack.Navigator>
  );
}
