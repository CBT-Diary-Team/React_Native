import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(true);
  const [agreePersonal, setAgreePersonal] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const isAllAgreed = agreePersonal && agreeTerms;

  const handleSignup = () => {
    if (!email || !password) {
      Alert.alert('에러', '이메일과 비밀번호를 입력하세요');
      return;
    }

    Alert.alert('성공', '회원가입이 완료되었습니다');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        keyboardType="email-address"
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

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>

      {/* 약관 동의 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>약관 동의</Text>

            <ScrollView style={styles.scroll}>
              <TouchableOpacity
                style={styles.agreeRow}
                onPress={() => setAgreePersonal(!agreePersonal)}
              >
                <Text style={styles.checkbox}>{agreePersonal ? '✅' : '⬜'}</Text>
                <Text style={styles.agreeText}>[필수] 개인정보 수집 및 이용</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.agreeRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
              >
                <Text style={styles.checkbox}>{agreeTerms ? '✅' : '⬜'}</Text>
                <Text style={styles.agreeText}>[필수] 서비스 이용 약관</Text>
              </TouchableOpacity>
            </ScrollView>

            <Pressable
              style={[styles.closeButton, { opacity: isAllAgreed ? 1 : 0.3 }]}
              onPress={() => isAllAgreed && setModalVisible(false)}
              disabled={!isAllAgreed}
            >
              <Text style={styles.closeButtonText}>동의하고 닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
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
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 24,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: { fontSize: 20, marginRight: 8 },
  agreeText: { fontSize: 16, color: '#333' },
  closeButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
