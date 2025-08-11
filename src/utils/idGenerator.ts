import { v4 as uuidv4 } from 'uuid';

/**
 * UUID v4를 사용하여 고유 ID 생성
 * @returns 고유한 UUID 문자열
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * 특정 prefix를 가진 ID 생성
 * @param prefix - ID 앞에 붙을 접두사
 * @returns prefix-uuid 형식의 문자열
 */
export function generateIdWithPrefix(prefix: string): string {
  return `${prefix}-${uuidv4()}`;
}

/**
 * 메시지 ID 생성 (uuid 사용)
 * @returns 메시지용 고유 ID
 */
export function generateMessageId(): string {
  return generateId();
}