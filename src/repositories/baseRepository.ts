import { createError } from '@/types/errors'

/**
 * Repository 기본 클래스
 * 공통 에러 처리 및 로깅 기능 제공
 */
export abstract class BaseRepository {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  /**
   * 통합 에러 처리 및 로깅
   */
  protected handleError(operation: string, error: unknown): never {
    const message = `[${this.tableName}] ${operation} failed`
    console.error(message, error)
    
    // DB 에러로 변환하여 throw
    throw createError.databaseError(
      `${operation} 작업 중 오류가 발생했습니다.`,
      error
    )
  }

  /**
   * 결과 확인 및 에러 처리
   */
  protected checkResult<T>(
    result: T | null | undefined,
    operation: string
  ): T {
    if (result === null || result === undefined) {
      this.handleError(operation, new Error('No result returned'))
    }
    return result
  }

  /**
   * 디버그 로깅 (개발 환경에서만)
   */
  protected debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.tableName}] ${message}`, data)
    }
  }
}