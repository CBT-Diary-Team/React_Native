// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as Keychain from 'react-native-keychain';

export type User = {
  id: string;
  name: string;
  // 필요하다면 email 등 다른 필드도 추가
};

export type AuthContextType = {
  userToken: string | null;
  user: User | null;          // userId, userName 보관
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  isLoading: true,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // 앱 시작 시 Keychain에서 토큰 불러와 백엔드로 유효성 검증
  useEffect(() => {
    (async () => {
      try {
        const creds = await Keychain.getGenericPassword();
        if (creds) {
          const token = creds.password;
          // 토큰 유효성 검증
          const res = await fetch('https://api.yoursite.com/auth/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const { id, name } = await res.json() as User;
            setUserToken(token);
            setUser({ id, name });
          } else {
            // 유효하지 않으면 저장된 토큰 삭제
            await Keychain.resetGenericPassword();
            setUserToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.warn('토큰 검증 또는 Keychain 읽기 실패', e);
        setUserToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

const signIn = async (token: string) => {
  setIsLoading(true);
  try {
    await Keychain.setGenericPassword('authToken', token);
    setUserToken(token);

    // ← 여기서 한 번만 사용자 정보 조회
    const res = await fetch('https://api.yoursite.com/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const { id, name } = (await res.json()) as User;
      setUser({ id, name });
    }
  } catch (e) {
    console.warn(e);
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};

  const signOut = async () => {
    setIsLoading(true);
    try {
      await Keychain.resetGenericPassword();
      setUserToken(null);
    } catch (e) {
      console.warn('Keychain 삭제 실패', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ userToken, user, isLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
