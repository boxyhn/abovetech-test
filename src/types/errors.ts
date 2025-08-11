/**
 * 커스텀 에러 클래스 및 에러 타입 정의
 */

export enum ErrorCode {
  // 요청 관련 에러
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_PARAMETERS = 'MISSING_PARAMETERS',
  
  // 세션 관련 에러
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  
  // 시스템 에러
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }

  toJSON() {
    const result: { error: string; code: ErrorCode; details?: unknown } = {
      error: this.message,
      code: this.code
    }
    
    if (this.details) {
      result.details = this.details
    }
    
    return result
  }
}

// 에러 팩토리 함수들
export const createError = {
  invalidRequest: (message = '잘못된 요청입니다.') =>
    new ApiError(ErrorCode.INVALID_REQUEST, 400, message),
  
  missingParameters: (message = '필수 파라미터가 누락되었습니다.') =>
    new ApiError(ErrorCode.MISSING_PARAMETERS, 400, message),
  
  sessionNotFound: (message = '세션을 찾을 수 없습니다.') =>
    new ApiError(ErrorCode.SESSION_NOT_FOUND, 404, message),
  
  internalError: (message = '서버 내부 오류가 발생했습니다.', details?: unknown) =>
    new ApiError(ErrorCode.INTERNAL_ERROR, 500, message, details),
  
  databaseError: (message = '데이터베이스 오류가 발생했습니다.', details?: unknown) =>
    new ApiError(ErrorCode.DATABASE_ERROR, 500, message, details)
}