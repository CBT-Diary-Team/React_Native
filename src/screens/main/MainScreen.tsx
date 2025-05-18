import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'Main'>;
type Post = { id: string; title: string; date: string; content: string };

const dummyPosts: Post[] = [
  { id: '1', title: '4월 1일 일기', date: '2025-04-01', content: '...' },
  { id: '2', title: '4월 2일 일기', date: '2025-04-02', content: '...' },
  { id: '3', title: '5월 9일 일기', date: '2025-05-09', content: '...' },
];

export default function MainScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    const marks: { [key: string]: { marked: boolean } } = {};
    dummyPosts.forEach((post) => {
      marks[post.date] = { marked: true };
    });
    return marks;
  }, []);

  const filteredPosts = dummyPosts.filter((post) => {
    const matchDate = selectedDate ? post.date === selectedDate : true;
    const matchKeyword = searchText ? post.title.includes(searchText) : true;
    return matchDate && matchKeyword;
  });

  return (
    <View style={styles.container}>
      {/* 1. 검색창 */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 일기 제목 검색"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* 2. 상담사 멘트 */}
      <TouchableOpacity style={styles.mentorBox} onPress={() => navigation.navigate('Write')}>
        <Text style={styles.emoji}>🧑‍⚕️</Text>
        <Text style={styles.mentorText}>오늘 하루 어땠나요? 일기를 남겨보세요!</Text>
      </TouchableOpacity>

      {/* 3. 글 목록 */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postItem}
            onPress={() => navigation.navigate('Analyze', { postId: item.id })}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.date}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 4. 달력 고정 */}
      <View style={styles.calendarContainer}>
        <Text style={styles.sheetTitle}>📅 일기 달력</Text>
        <Calendar
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  mentorBox: {
    backgroundColor: '#fff2e6',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  mentorText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  postItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  calendarContainer: {
    marginTop: 24,
    paddingBottom: 24,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

