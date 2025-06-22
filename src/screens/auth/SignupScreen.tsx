// src/screens/auth/SignupScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { BASIC_URL } from '../../constants/api';
import debounce from 'lodash.debounce';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

interface Res {
  status: string;
  message: string;
  data: boolean;
  timestamp: string;
}

export default function SignupScreen({ navigation }: Props) {
  const [loginId, setLoginId] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [loginIdAvailable, setLoginIdAvailable] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [nickname, setNickname] = useState('');
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [agreePersonal, setAgreePersonal] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [loginIdError, setLoginIdError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  const isLoginIdTooShort = (loginId: string): boolean =>
    loginId.length > 0 && loginId.length < 4;

  const isValidEmailFormat = (email: string): boolean =>
    /^\S+@\S+\.\S+$/.test(email);

  const isValidPassword = (
    password: string,
    loginId: string // 비밀번호에 ID 포함 검사용
  ): boolean => {
    if (password.length < 8 || password.length > 50) return false;
    const patterns = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/];
    if (patterns.filter(rx => rx.test(password)).length < 3) return false;
    if (/(.)\1\1/.test(password)) return false;
    if (loginId && password.includes(loginId)) return false;
    return true;
  };

  // Debounced API checks
  const debouncedCheckLoginId = useRef(
    debounce(async (value: string) => {
      try {
        const res = await fetch(`${BASIC_URL}/api/public/check/loginId/IsDuplicate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginId: value }),
        });
        const res_json:Res = await res.json();
        setLoginIdAvailable(res_json.data);
        if(!loginIdAvailable){
          setLoginIdError(`${res_json.message}`)
        } else {
          setLoginIdError("")
        }
      } catch (e: any) {
        setLoginIdAvailable(null)
        setLoginIdError(e.message || '알 수 없는 오류가 발생했습니다.');
      }
    }, 300)
  ).current;

  const debouncedCheckEmail = useRef(
    debounce(async (value: string) => {
      try {
        const res = await fetch(`${BASIC_URL}/api/public/check/email/IsDuplicate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value }),
        });
        const res_json:Res = await res.json();
        setEmailAvailable(res_json.data);
        if(!emailAvailable){
          setEmailError(`${res_json.message}`)
        } else {
          setEmailError("")
        }
      } catch (e: any) {
        setEmailAvailable(null)
        setEmailError(e.message || '알 수 없는 오류가 발생했습니다.');
      }
    }, 300)
  ).current;

  const debouncedCheckNickname = useRef(
    debounce(async (value: string) => {
      if (!value) return;
      try {
        const res = await fetch(`${BASIC_URL}/api/public/check/nickname/IsDuplicate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: value }),
        });
        const res_json:Res = await res.json();
        setNicknameAvailable(res_json.data);
        if(!emailAvailable){
          setNicknameError(`${res_json.message}`)
        } else {
          setNicknameError("")
        }
      } catch (e: any) {
        setNicknameAvailable(null)
        setNicknameError(e.message || '알 수 없는 오류가 발생했습니다.');
      }
    }, 300)
  ).current;



  const handleLoginIdChange = (text: string) => {
    setLoginId(text);
    setLoginIdAvailable(null);
    if (text&&isLoginIdTooShort(text)) {
      setLoginIdError('아이디는 4자 이상이어야 합니다.');
    } else {
      setLoginIdError('');
      // debouncedCheckLoginId(text);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailAvailable(null);
    if (text && !isValidEmailFormat(text)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
    } else {
      setEmailError('');
      debouncedCheckEmail(text);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // 패스워드 유효성 검사
    if (text && !isValidPassword(text, loginId)) {
      setPasswordError('비밀번호는 8~50자, 영문/숫자/특수문자 중 3종류 이상이어야 합니다.');
    } else if (confirmPassword && text !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    // 확인용 패스워드 일치 여부만 검사
    if (password && text !== password) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    setNicknameAvailable(null);
    debouncedCheckNickname(text);
  };
  const handleSendEmailCode = async () => {
    if (!emailAvailable) {
      Alert.alert('오류', '먼저 올바른 이메일을 입력해주세요.');
      return;
    }
    try {
      // 예시: 인증번호 요청 API 호출
      const res = await fetch(`${BASIC_URL}/api/public/emailCode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json() as {
        status: string;
        message: string;
        data: any;
      };
      // API가 돌려주는 message를 그대로 띄움
      Alert.alert(
        json.status === 'success' ? '확인' : '오류',
        json.message
      );
    } catch (e: any) {
      Alert.alert('오류', '인증번호 발송에 실패했습니다.');
    }
  };
    const handleConfirmEmailCode = async () => {
    try {
      const res = await fetch(`${BASIC_URL}/api/public/emailCheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: emailCode }),
      });
      const json = await res.json() as {
        status: string;
        message: string;
        data: any;
      };
      Alert.alert(
        json.status === 'success' ? '확인' : '오류',
        json.message
      );
      // 인증 성공 여부 저장
      setIsEmailVerified(json.status === 'success');
    } catch {
      Alert.alert('오류', '인증 확인 중 오류가 발생했습니다.');
    }
  };
  const handleSignup = async () => {
    try {
      const res = await fetch(
        `${BASIC_URL}/api/public/join`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginId, userPw: password, email, nickname }),
        }
      );
      const json = await res.json() as { status: string; message: string };
      if (json.status === 'success') {
        Alert.alert(
          '성공',
          json.message,
          [{ text: '확인', onPress: () => navigation.replace('SignIn') }],
          { cancelable: false }
        );
      } else {
        Alert.alert('실패', json.message || '회원가입에 실패했습니다');
      }
    } catch {
      Alert.alert('오류', '네트워크 오류가 발생했습니다');
    }
  };

  const allFieldsValid =
    !!loginId &&
    loginIdAvailable === true &&
    !!email &&
    emailAvailable === true &&
    isValidPassword(password, loginId) &&
    isEmailVerified === true &&
    password === confirmPassword &&
    !!nickname &&
    nicknameAvailable === true &&
    agreePersonal &&
    agreeTerms;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.centerBox} keyboardShouldPersistTaps="handled">
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="cover"
        />
        <TextInput
          style={[styles.input, { marginBottom: 16 }]} 
          placeholder="아이디"
          placeholderTextColor="#999"
          value={loginId}
          onChangeText={handleLoginIdChange}
        />
        {loginIdError ? <Text style={styles.errorText}>{loginIdError}</Text> : null}
        <View style={styles.rowContainer}>
          <TextInput
            style={[styles.rowInput, styles.flex7]}
            placeholder="이메일"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={handleEmailChange}
          />
          <TouchableOpacity style={[styles.buttonSendSmall, styles.flex3]} onPress={handleSendEmailCode}>
            <Text style={styles.buttonSmallText}>인증번호 발송</Text>
          </TouchableOpacity>
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <View style={styles.rowContainer}>
          <TextInput
            style={[styles.rowInput, styles.flex7]}
            placeholder="인증번호 입력"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={emailCode}
            onChangeText={setEmailCode}
          />
          <TouchableOpacity style={[styles.buttonSmall, styles.flex3]} onPress={handleConfirmEmailCode}>
            <Text style={styles.buttonSmallText}>확인</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, { marginBottom: 16 }]} 
          placeholder="닉네임"
          placeholderTextColor="#999"
          value={nickname}
          onChangeText={handleNicknameChange}
        />
        {nicknameError ? <Text style={styles.errorText}>{nicknameError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={handlePasswordChange}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </ScrollView>

      <View style={styles.agreeContainer}>
        <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreePersonal(!agreePersonal)}>
          <Text style={styles.checkbox}>{agreePersonal ? '✅' : '⬜'}</Text>
          <Text style={styles.agreeText}>[필수] 개인정보 수집 및 이용</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        style={[styles.agreeRow, {marginBottom: 4}]}
         onPress={() => setAgreeTerms(!agreeTerms)}>
          <Text style={styles.checkbox}>{agreeTerms ? '✅' : '⬜'}</Text>
          <Text style={styles.agreeText}>[필수] 서비스 이용 약관</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { opacity: allFieldsValid ? 1 : 0.5 }]}
        onPress={handleSignup}
        disabled={!allFieldsValid}
      >
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  centerBox: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },

  logo: {
    width: 180,
    height: 90,
    alignSelf: 'center',
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    marginBottom: 8,
    height: 48, 
  },
  rowInput: {
    flex: 7,
    height: 48,               // 고정 높이
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,    // 세로 패딩 제거
    color: '#000',
    textAlignVertical: 'center', // Android에서 텍스트 수직 중앙
    marginRight: 8,
  },
  buttonSendSmall: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B8B0',
    borderRadius: 8,
    height: 48, 
  },
  buttonSmall: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6C757D',
    borderRadius: 8,
    height: 48, 
  },
  buttonSmallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  flex7: { flex: 7, marginRight: 8 },
  flex3: { flex: 3 },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    color: '#000',
    height: 48, 
  },

  errorText: {
    width: '90%',
    color: 'red',
    marginBottom: 8,
    marginLeft: '5%',
  },

  agreeContainer: {
    width: '90%',
    paddingHorizontal: '5%',
    marginBottom: 20,
  },

  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  checkbox: {
    fontSize: 20,
    marginRight: 8,
  },

  agreeText: {
    fontSize: 16,
    color: '#333',
  },

  button: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#C4B5FD',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 52,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
