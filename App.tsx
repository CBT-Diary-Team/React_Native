import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator'; // 🔁 여기로 변경

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />  {/* ✅ RootNavigator에서 조건부로 AppStack/AuthStack 렌더링 */}
    </GestureHandlerRootView>
  );
}
