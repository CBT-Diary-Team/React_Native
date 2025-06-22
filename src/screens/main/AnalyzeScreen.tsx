import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../context/AuthContext';
import { BASIC_URL } from '../../constants/api';

type Props = NativeStackScreenProps<AppStackParamList, 'Analyze'>;

// API 응답 타입
interface AIResponseDto {
  id: string;
  userId: string;
  diaryTitle: string;
  diaryContent: string;
  emotions: { category: string; intensity: number }[];
  summary: string;
  coaching: string;
  createdAt: string;
  updatedAt: string;
}

export default function AnalyzeScreen({ route }: Props) {
  const { diaryId } = route.params;
  const { fetchWithAuth, user } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<AIResponseDto | null>(null);

  useEffect(() => {
    if (!user) {
      Alert.alert('로그인이 필요합니다.');
      setIsLoading(false);
      return;
    }

    fetchWithAuth(`${BASIC_URL}/api/diary/response/${diaryId}`, { method: 'GET' })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || `서버 에러: ${res.status}`);
        }
        return res.json() as Promise<AIResponseDto>;
      })
      .then(data => setResult(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [diaryId, fetchWithAuth, user]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!result) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 제목 & 내용 */}
        <View style={styles.section}>
          <Text style={styles.title}>{result.diaryTitle}</Text>
          <Text style={styles.content}>{result.diaryContent}</Text>
        </View>

        {/* 감정 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 감정 분석 결과</Text>
          {result.emotions.map(({ category, intensity }) => (
            <View style={styles.row} key={category}>
              <Text style={styles.boldText}>{category}:</Text>
              <Text style={styles.text}>{intensity}/10</Text>
            </View>
          ))}
        </View>

        {/* 요약 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 요약</Text>
          <Text style={styles.text}>{result.summary}</Text>
        </View>

        {/* 코칭 메시지 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 코칭 메시지</Text>
          <Text style={styles.text}>{result.coaching}</Text>
        </View>

        {/* 생성/수정 일시 */}
        <View style={styles.section}>  
          <Text style={styles.subtext}>
            작성: {new Date(result.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.subtext}>
            수정: {new Date(result.updatedAt).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  container: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#D32F2F', fontSize: 16, textAlign: 'center' },

  section: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#333' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#333' },
  content: { fontSize: 16, lineHeight: 24, color: '#333' },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  boldText: { fontSize: 16, fontWeight: '600', marginRight: 8, color: '#333' },
  text: { fontSize: 16, color: '#333' },
  subtext: { fontSize: 14, color: '#666', marginBottom: 4 },
});
