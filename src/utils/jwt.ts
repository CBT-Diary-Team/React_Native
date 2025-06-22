// src/utils/jwt.ts

import { Buffer } from 'buffer';

export interface JwtPayload {
  id: string;
  [key: string]: any;
}

/**
 * JWT 토큰에서 페이로드(JSON)를 디코딩해서 반환합니다.
 * Node.js Buffer를 활용하므로 React Native 환경에서도 동작합니다.
 */
export function decodeJwt<T = JwtPayload>(token: string): T {
  if (!token) throw new Error('토큰이 비어있습니다.');
  // 토큰 구조: header.payload.signature
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('유효하지 않은 JWT 형식입니다.');

  const base64Url = parts[1];
  // Base64 URL-safe -> 표준 Base64 변환
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  // Buffer로 디코딩
  const payloadBuffer = Buffer.from(base64, 'base64');
  const payloadText = payloadBuffer.toString('utf8');
  // JSON 파싱
  return JSON.parse(payloadText) as T;
}
