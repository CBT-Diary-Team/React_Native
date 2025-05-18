import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'Analyze'>;

export default function AnalyzeScreen({ route }: Props) {
  const { postId } = route.params;

  // ⚠️ 나중에 postId로 DB에서 title/content 불러와야 함
  const title = '4월 12일 일기';
  const content = `며칠째 오목 ai를 만들고 있는 중이다. 교수님은 gpt 뚝딱하면 뿅 하고 나오는 줄 아는데...`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 제목 & 내용 */}
        <View style={styles.block}>
          <Text style={styles.heading}>📘 글 제목</Text>
          <Text style={styles.text}>{title}</Text>

          <Text style={[styles.heading, { marginTop: 20 }]}>📝 글 내용</Text>
          <Text style={styles.text}>{content}</Text>
        </View>

        {/* 감정 식별 */}
        <Section title="🧠 1. 감정 식별하기" subtitle="네 일기에서 느껴지는 주요 감정은 다음과 같아:">
          <Text style={styles.text}>- 좌절감: "며칠 째 이러는지 미치겠다"</Text>
          <Text style={styles.text}>- 압박감: "이걸 끝내야 다른 과제나 프로젝트를 좀 살펴볼텐데"</Text>
          <Text style={styles.text}>- 불안감: "이 과제도 해결 못 하는 나를 보면 너무 우울해진다"</Text>
          <Text style={styles.text}>- 자기비하: "난 밥 벌어먹고 살 수 있을까..."</Text>
        </Section>

        {/* 자동적 사고 */}
        <Section title="🔍 2. 자동적 사고 탐색" subtitle="아래와 같은 자동적 사고가 감지됐어:">
          <Text style={styles.text}>- 이분법적 사고: "해결 못 하면 나는 무능해"</Text>
          <Text style={styles.text}>- 과잉 일반화: "과제도 못 하니까 다른 것도 다 못 할 거야"</Text>
          <Text style={styles.text}>- 미래예측: "이걸 못 하면 취업도 못 할 거야"</Text>
        </Section>

        {/* 사고 교정 프롬프트 */}
        <Section title="💡 3. 사고 교정 프롬프트" subtitle="스스로에게 물어보자:">
          <Text style={styles.text}>- 지금 내가 과제 하나 때문에 나 전체를 평가하고 있는 건 아닐까?</Text>
          <Text style={styles.text}>- 과제가 본질적으로 어려운 건 아닐까?</Text>
          <Text style={styles.text}>- 내가 지금까지 이뤄낸 것도 있지 않았나?</Text>
          <Text style={styles.text}>- 나는 지금 열심히 배우고 있다는 증거 아닐까?</Text>
        </Section>

        {/* 대안적 사고 */}
        <Section title="🌱 4. 대안적 사고 정리" subtitle="조금 시선을 바꿔보자:">
          <Text style={styles.text}>
            지금 과제가 막히고 있지만, 그건 내가 열심히 시도하고 있다는 증거다.{"\n"}
            이 과정이 쌓이면 분명히 나중에 취업 준비에도 도움이 될 거다.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.subtext}>{subtitle}</Text>}
      {children}
    </View>
    <View style={styles.separator} />
  </>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  scrollContainer: { padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
  subtext: { fontSize: 14, color: '#666', marginBottom: 10 },
  block: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 1,
  },
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
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginTop: 20,
    marginBottom: 20,
    opacity: 0.6,
  },
});
