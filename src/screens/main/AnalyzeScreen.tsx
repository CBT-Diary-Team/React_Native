// src/screens/AnalyzeScreen.tsx

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

// jwtDecode을 require로 불러와 TS 선언 에러 방지
// eslint-disable-next-line @typescript-eslint/no-var-requires

type Props = NativeStackScreenProps<AppStackParamList, 'Analyze'>;

// API 응답 타입 정의
interface AnalysisResult {
  id: number;
  emotionDetection: {
    joy: number;
    sadness: number;
    surprise: number;
    calm: number;
  };
  emotionSummary: string;
  automaticThought: string;
  promptForChange: string;
  alternativeThought: string;
  status: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
  analyzedAt: string; // ISO 8601
}

// 토큰 페이로드 타입
interface TokenPayload {
  id: string;      // User Table의 PK
  loginId: string;
  exp: number;
  iat: number;
}

export default function AnalyzeScreen({ route }: Props) {
  const { diaryId } = route.params;
  const { fetchWithAuth, userToken, user } = useContext(AuthContext);

  // 로딩/에러 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // “분석 진행 중” 상태
  const [inProgress, setInProgress] = useState<{
    message: string;
    progress: number;
    estimatedRemaining: string;
  } | null>(null);

  // 최종 분석 결과
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnalysis = async () => {
      if (!user) {
        Alert.alert('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetchWithAuth(
          `${BASIC_URL}/api/diaries/${diaryId}/analysis`,
          { method: 'GET' }
        );

        if (!res.ok) {
          const errJson = await res.json();
          throw new Error(errJson.message || `서버 에러: ${res.status}`);
        }

        const data = await res.json();

        // “분석 진행 중” 응답인지
        if (data.message && typeof data.progress === 'number') {
          if (isMounted) {
            setInProgress({
              message: data.message,
              progress: data.progress,
              estimatedRemaining: data.estimatedRemaining,
            });
          }
        } 
        // “분석 완료” 응답인지
        else if (data.analysis && typeof data.analysis === 'object') {
          if (isMounted) {
            setAnalysis(data.analysis as AnalysisResult);
          }
        } else {
          throw new Error('알 수 없는 응답 형식입니다.');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalysis();
    return () => {
      isMounted = false;
    };
  }, [diaryId, fetchWithAuth, user]);

  // 로딩 중
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  // 에러
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // 분석 진행 중
  if (inProgress) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.progressText}>{inProgress.message}</Text>
          <Text style={styles.progressText}>
            진행률: {inProgress.progress}%
          </Text>
          <Text style={styles.subtext}>
            예상 남은 시간: {inProgress.estimatedRemaining}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 최종 분석 결과
  if (analysis) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* TODO: 필요하다면 여기서 제목/내용을 따로 fetch하여 보여주세요 */}

          {/* 1) 감정 식별 결과 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧠 1. 감정 식별하기</Text>
            {['joy', 'sadness', 'surprise', 'calm'].map((key) => (
              <View style={styles.row} key={key}>
                <Text style={styles.boldText}>
                  {{
                    joy: '기쁨',
                    sadness: '슬픔',
                    surprise: '놀람',
                    calm: '평온',
                  }[key as keyof typeof analysis.emotionDetection]}
                  :
                </Text>
                <Text style={styles.text}>
                  {analysis.emotionDetection[key as keyof typeof analysis.emotionDetection]}%
                </Text>
              </View>
            ))}
            <Text style={styles.subtext}>{analysis.emotionSummary}</Text>
          </View>

          {/* 2) 자동적 사고 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 2. 자동적 사고 탐색</Text>
            <Text style={styles.text}>{analysis.automaticThought}</Text>
          </View>

          {/* 3) 사고 교정 프롬프트 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 3. 사고 교정 프롬프트</Text>
            <Text style={styles.text}>{analysis.promptForChange}</Text>
          </View>

          {/* 4) 대안적 사고 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌱 4. 대안적 사고 정리</Text>
            <Text style={styles.text}>{analysis.alternativeThought}</Text>
          </View>

          {/* 부가 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔖 부가 정보</Text>
            <Text style={styles.text}>
              상태: {analysis.status} {'\n'}
              확신도: {(analysis.confidence * 100).toFixed(1)}% {'\n'}
              분석 완료 시각: {new Date(analysis.analyzedAt).toLocaleString()}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  scrollContainer: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#D32F2F', fontSize: 16, textAlign: 'center' },
  progressText: { fontSize: 18, marginBottom: 8, color: '#333' },
  subtext: { fontSize: 14, color: '#666' },

  section: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  boldText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: '#333',
  },
  text: { fontSize: 16, lineHeight: 24, marginBottom: 8, color: '#333' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
});
