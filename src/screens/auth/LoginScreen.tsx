// src/screens/auth/LoginScreen.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import CryptoJS from 'crypto-js';
import { AuthContext } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const SECRET_KEY = 'your-secret-key'; // 절대 깃허브 등에 올라가면 안 됩니다!

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    // 1) 입력 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return Alert.alert('에러', '이메일을 입력하세요');
    }
    if (!emailRegex.test(email)) {
      return Alert.alert('에러', '유효한 이메일을 입력하세요');
    }
    if (!password) {
      return Alert.alert('에러', '비밀번호를 입력하세요');
    }
    if (password.length < 6) {
      return Alert.alert('에러', '비밀번호는 최소 6자 이상이어야 합니다');
    }

    // 2) 암호화
    const encryptedEmail = CryptoJS.AES.encrypt(email, SECRET_KEY).toString();
    const hashedPassword = CryptoJS.SHA256(password).toString();

    // 3) API 요청
    setLoading(true);
    try {
      const res = await fetch('https://api.yoursite.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: encryptedEmail,
          password: hashedPassword,
        }),
      });
      const json = await res.json();
      setLoading(false);

      if (res.ok) {
        // Context에 토큰 저장 → RootNavigator가 AppStack으로 전환됩니다
        await signIn(json.token);
      } else {
        Alert.alert('로그인 실패', json.message || '알 수 없는 오류가 발생했습니다');
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('네트워크 오류', error.message);
    }
  };

  const handleNaverLogin = () => {
    Alert.alert('네이버 로그인', '아직 구현 안 됨 😅');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>이메일 로그인</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.naverButton]}
        onPress={handleNaverLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>네이버 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  naverButton: {
    backgroundColor: '#2DB400',
  },
  signupButton: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
