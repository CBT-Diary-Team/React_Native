// src/screens/WriteScreen.tsx

import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../context/AuthContext';
import { BASIC_URL } from '../../constants/api';

// jwtDecode을 require로 불러와 TS 에러 방지
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwtDecode = require('jwt-decode');

type Props = NativeStackScreenProps<AppStackParamList, 'Write'>;

type AIResponseDto = {
  id: string;
  diaryTitle: string;
  diaryContent: string;
  createdAt: string;
};

interface TokenPayload {
  id: string;      // User Table ID
  loginId: string;
  exp: number;
  iat: number;
}

export default function WriteScreen({ route, navigation }: Props) {
  const { userToken, fetchWithAuth } = useContext(AuthContext);

  // 토큰에서 User Table ID 추출
  const decoded: TokenPayload = userToken
    ? jwtDecode(userToken)
    : { id: '', loginId: '', exp: 0, iat: 0 };
  const userId = decoded.id;

  // route.params.postId가 있으면 수정 모드
  const diaryId = (route.params as { diaryId?: string })?.diaryId;

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /** 수정 모드: 기존 응답 불러오기 */
  useEffect(() => {
    if (!diaryId) return;
    setIsLoading(true);
    fetchWithAuth(`${BASIC_URL}/api/diary/response/${diaryId}`, { method: 'GET' })
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            Alert.alert('해당 일기를 찾을 수 없습니다.');
            navigation.goBack();
            return null;
          }
          throw new Error();
        }
        return res.json();
      })
      .then((data: AIResponseDto | null) => {
        if (data) {
          const [y, m, d] = data.createdAt
            .split('T')[0]
            .split('-')
            .map(n => parseInt(n, 10));
          setDate(new Date(y, m - 1, d));
          setTitle(data.diaryTitle);
          setContent(data.diaryContent);
        }
      })
      .catch((err: any) => {
        Alert.alert('불러오기 실패', err.message || '오류가 발생했습니다.');
        navigation.goBack();
      })
      .finally(() => setIsLoading(false));
  }, [diaryId]);

  const onPressDate = () => setShowPicker(true);
  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selected) setDate(selected);
  };
  const formatDate = (d?: Date) =>
    d
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`
      : '';

  /** 제출 처리 */
  const handleSubmit = async () => {
    if (!date) return Alert.alert('날짜를 선택하세요.');
    if (!title.trim()) return Alert.alert('제목을 입력하세요.');
    if (!content.trim()) return Alert.alert('내용을 입력하세요.');
    if (!userId) return Alert.alert('로그인이 필요합니다.');

    setIsLoading(true);
    try {
      if (diaryId) {
        // 수정 모드
        const res = await fetchWithAuth(
          `${BASIC_URL}/api/diary/response/${diaryId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              diaryTitle: title.trim(),
              diaryContent: content.trim(),
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json();
          return Alert.alert('수정 실패', err.message || '서버 에러');
        }
        navigation.goBack();
      } else {
        // 새 일기 작성 모드
        const res = await fetchWithAuth(
          `${BASIC_URL}/api/diary/analyze`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: title.trim(),
              content: content.trim(),
              userId, // 토큰에서 추출한 User Table ID
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json();
          return Alert.alert('작성 실패', err.message || '서버 에러');
        }
        const data: AIResponseDto = await res.json();
        navigation.navigate('Analyze', { diaryId: data.id });
      }
    } catch {
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inputContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="cover"
        />

        <TouchableOpacity onPress={onPressDate} style={styles.dateWrapper}>
          <TextInput
            style={styles.dateInput}
            placeholder="날짜 선택"
            placeholderTextColor="#999"
            value={formatDate(date)}
            editable={false}
          />
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            onChange={onChangeDate}
          />
        )}

        <TextInput
          style={[styles.input, styles.titleInput]}
          value={title}
          onChangeText={setTitle}
          placeholder="제목"
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.input, styles.contentInput]}
          value={content}
          onChangeText={setContent}
          placeholder="내용"
          placeholderTextColor="#999"
          multiline
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {diaryId ? '수정 완료' : '새 일기 작성하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', paddingTop: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' },
  inputContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  dateWrapper: { marginBottom: 16 },
  dateInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00B8B0',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00B8B0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  titleInput: { height: 50, marginBottom: 16 },
  contentInput: { flex: 1, textAlignVertical: 'top' },
  buttonContainer: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#F0F4F8' },
  button: {
    backgroundColor: '#00B8B0',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 50,
  },
  buttonDisabled: { backgroundColor: '#9CCFFF' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  logo: { width: 180, height: 90, alignSelf: 'center', marginBottom: 20 },
});
