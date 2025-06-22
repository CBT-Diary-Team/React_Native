// src/screens/main/MainScreen.tsx

import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Image,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { jwtDecode } from 'jwt-decode';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../context/AuthContext';
import { BASIC_URL } from '../../constants/api';

export type Props = NativeStackScreenProps<AppStackParamList, 'Main'>;
type Post = { id: string; title: string; date: string };

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

interface TokenPayload {
  id: string; // User Table ID
  loginId: string;
  exp: number;
  iat: number;
}

export default function MainScreen({ navigation }: Props) {
  const { userToken, fetchWithAuth } = useContext(AuthContext);

  let decoded: TokenPayload = { id: '', loginId: '', exp: 0, iat: 0 };

  if (userToken) {
    decoded = jwtDecode<TokenPayload>(userToken);
  }
  const userId = decoded.id;

  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [allDates, setAllDates] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  // AIResponseDto -> Post 변환
  const mapToPost = (item: AIResponseDto): Post => ({
    id: item.id,
    title: item.diaryTitle,
    date: item.createdAt.split('T')[0],
  });

  // 1) 달력에 표시할 날짜들
  useEffect(() => {
    const loadDates = async () => {
      if (!userId) return;
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(
          new Date(year, month + 1, 0).getDate()
        ).padStart(2, '0')}`;
        const res = await fetchWithAuth(
          `${BASIC_URL}/api/diary/responses/${userId}/range?startDate=${startDate}&endDate=${endDate}`
        );
        const data: AIResponseDto[] = await res.json();
        setAllDates(data.map(d => d.createdAt.split('T')[0]));
      } catch (e: any) {
        Alert.alert('달력 조회 중 오류', e.message || '알 수 없는 오류가 발생했습니다.');
      }
    };
    loadDates();
  }, [userId]);

  // 2) 전체 또는 검색 조회 (클라이언트 사이드 페이징)
  const loadAllOrSearch = async (page: number) => {
    if (!userId) return;
    try {
      const res = await fetchWithAuth(
        `${BASIC_URL}/api/diary/responses/${userId}`
      );
      let data: AIResponseDto[] = await res.json();
      if (searchText) {
        data = data.filter(d =>
          d.diaryTitle.includes(searchText) || d.diaryContent.includes(searchText)
        );
      }
      setTotalCount(data.length);
      const pageItems = data.slice(
        page * ITEMS_PER_PAGE,
        (page + 1) * ITEMS_PER_PAGE
      );
      setFilteredPosts(pageItems.map(mapToPost));
    } catch (e: any) {
      Alert.alert('일기 조회 중 오류', e.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  // 3) 날짜별 조회
  const loadByDate = async (date: string, page: number) => {
    if (!userId) return;
    try {
      const res = await fetchWithAuth(
        `${BASIC_URL}/api/diary/responses/${userId}/range?startDate=${date}&endDate=${date}`
      );
      const data: AIResponseDto[] = await res.json();
      setTotalCount(data.length);
      const pageItems = data.slice(
        page * ITEMS_PER_PAGE,
        (page + 1) * ITEMS_PER_PAGE
      );
      setFilteredPosts(pageItems.map(mapToPost));
    } catch (e: any) {
      Alert.alert('일기 조회 중 오류', e.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  // 초기 로드
  useEffect(() => {
    setSelectedDate(null);
    setCurrentPage(0);
    loadAllOrSearch(0);
  }, [userId]);

  // 페이지 변경 핸들러
  const goToPage = (page: number) => {
    setCurrentPage(page);
    if (selectedDate) {
      loadByDate(selectedDate, page);
    } else {
      loadAllOrSearch(page);
    }
  };

  const handleDateSelect = (date: string) => {
    Keyboard.dismiss();
    setSelectedDate(date);
    setSearchText('');
    setCurrentPage(0);
    loadByDate(date, 0);
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    setSelectedDate(null);
    setCurrentPage(0);
    loadAllOrSearch(0);
  };

  const markedDates = useMemo(() => {
    const marks: { [key: string]: { marked: boolean } } = {};
    allDates.forEach(d => {
      marks[d] = { marked: true };
    });
    return marks;
  }, [allDates]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => navigation.navigate('View', { diaryId: item.id })}
    >
      <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.title}</Text>
      <Text style={{ color: '#777' }}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="cover"
      />
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 제목/내용 검색"
        placeholderTextColor="#555"
        selectionColor="#4a90e2"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setCalendarVisible(prev => !prev)}
      >
        <Text style={styles.toggleButtonText}>
          {calendarVisible ? '달력 숨기기' : '달력 보기'}
        </Text>
      </TouchableOpacity>
      {calendarVisible && (
        <View style={styles.calendarContainer}>
          <Text style={styles.sheetTitle}>📅 일기 달력</Text>
          <Calendar markedDates={markedDates} onDayPress={day => handleDateSelect(day.dateString)} />
        </View>
      )}
      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={renderPostItem}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, marginBottom: 12 }}
      />
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          disabled={!hasPrev}
          onPress={() => hasPrev && goToPage(currentPage - 1)}
          style={[styles.pageButton, !hasPrev && styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>{'< 이전'}</Text>
        </TouchableOpacity>
        <Text style={styles.pageIndicator}>
          {currentPage + 1} / {totalPages || 1}
        </Text>
        <TouchableOpacity
          disabled={!hasNext}
          onPress={() => hasNext && goToPage(currentPage + 1)}
          style={[styles.pageButton, !hasNext && styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>{'다음 >'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Write')}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  logo: { width: 180, height: 90, alignSelf: 'center', marginBottom: 20 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: '#d0e8ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButtonText: { fontSize: 16, fontWeight: '500' },
  postItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  calendarContainer: { marginBottom: 16 },
  sheetTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4a90e2',
    borderRadius: 6,
    marginHorizontal: 8,
  },
  pageButtonDisabled: { backgroundColor: '#ccc' },
  pageButtonText: { color: '#fff', fontSize: 14 },
  pageIndicator: { fontSize: 16, fontWeight: '500' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00B8B0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: { color: '#fff', fontSize: 48, textAlign: 'center', lineHeight: 56 },
});
