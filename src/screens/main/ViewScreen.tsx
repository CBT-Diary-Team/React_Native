// src/screens/PostDetailScreen.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../context/AuthContext';
import { BASIC_URL } from '../../constants/api';

type Props = NativeStackScreenProps<AppStackParamList, 'View'>;

interface PostData {
  id: string;
  date: string;        // YYYY-MM-DD
  title: string;
  content: string;
  aiResponse: boolean;
}

export default function ViewScreen({ route, navigation }: Props) {
  const { diaryId } = route.params as { diaryId: string };
  const { fetchWithAuth, user, isAuthLoading } = useContext(AuthContext);

  const [post, setPost] = useState<PostData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const loadPost = async () => {
      if (!user) {
        Alert.alert('로그인이 필요합니다.');
        return;
      }
      try {
        const res = await fetchWithAuth(
          `${BASIC_URL}/api/diary/response/${diaryId}`,
          { method: 'GET' }
        );
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('해당 글을 찾을 수 없습니다.');
          }
          const errJson = await res.json();
          throw new Error(errJson.message || '서버 에러가 발생했습니다.');
        }
        const data: PostData = await res.json();
        if (isMounted) setPost(data);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      }
    };
    loadPost();
    return () => { isMounted = false; };
  }, [diaryId]);

  const handleAnalyze = async () => {
    if (!post) return;
    if (!user) {
      Alert.alert('로그인이 필요합니다.');
      return;
    }
    try {
      if (!post.aiResponse) {
        const res = await fetchWithAuth(
          `${BASIC_URL}/api/diaries/${post.id}/analysis`,
          { method: 'POST' }
        );
        if (!res.ok) {
          const errJson = await res.json();
          Alert.alert('분석 오류', errJson.message || 'AI 분석 요청에 실패했습니다.');
          return;
        }
      }
      navigation.navigate('Analyze', { diaryId: post.id });
    } catch (e: any) {
      console.warn('AI 분석 요청 중 오류:', e);
      Alert.alert('오류', 'AI 분석 중에 문제가 발생했습니다.');
    }
  };

  // 삭제 처리
  const confirmDelete = () => {
    Alert.alert(
      '삭제 확인',
      '정말 이 일기를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetchWithAuth(
                `${BASIC_URL}/api/diary/response/${diaryId}`,
                { method: 'DELETE' }
              );
              if (!res.ok) {
                const errJson = await res.json();
                Alert.alert('삭제 실패', errJson.message || '서버 에러');
                return;
              }
              Alert.alert('삭제되었습니다.');
              navigation.goBack();
            } catch {
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isAuthLoading) {
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

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.postDate}>{post.date}</Text>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postContent}>{post.content}</Text>
      </View>

      {post.aiResponse ? (
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.button, styles.analyzeButton]}
            onPress={handleAnalyze}
          >
            <Text style={styles.buttonText}>AI 분석 보러가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('Write', { diaryId: post.id })}
          >
            <Text style={styles.buttonText}>수정하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.analyzeButton]}
            onPress={handleAnalyze}
          >
            <Text style={styles.buttonText}>분석하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 삭제 버튼 */}
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={confirmDelete}
        >
          <Text style={styles.buttonText}>삭제하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#F0F4F8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FFD54F',
    marginRight: 8,
  },
  analyzeButton: {
    backgroundColor: '#4A90E2',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
