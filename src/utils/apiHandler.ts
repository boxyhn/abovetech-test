import { NextRequest, NextResponse } from 'next/server'
import { ApiError, createError } from '@/types/errors'

/**
 * API 핸들러 래퍼 - 일반 라우트용
 */
export function apiHandler<T = unknown>(
  handler: (req: NextRequest) => Promise<T>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const result = await handler(req)
      
      // 이미 NextResponse인 경우 그대로 반환
      if (result instanceof NextResponse) {
        return result
      }
      
      // 일반 객체인 경우 성공 응답으로 래핑
      return NextResponse.json(result)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Dynamic Route 핸들러 래퍼
 */
export function dynamicApiHandler<T = unknown, P = Record<string, string>>(
  handler: (req: NextRequest, params: P) => Promise<T>
) {
  return async (
    req: NextRequest,
    context: { params: Promise<P> }
  ): Promise<NextResponse> => {
    try {
      const params = await context.params
      const result = await handler(req, params)
      
      // 이미 NextResponse인 경우 그대로 반환
      if (result instanceof NextResponse) {
        return result
      }
      
      // 일반 객체인 경우 성공 응답으로 래핑
      return NextResponse.json(result)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * 표준화된 에러 처리
 */
export function handleApiError(error: unknown): NextResponse {
  // ApiError 인스턴스인 경우
  if (error instanceof ApiError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode })
  }
  
  // 일반 Error 인스턴스인 경우
  if (error instanceof Error) {
    const apiError = createError.internalError(error.message)
    return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode })
  }
  
  // 알 수 없는 에러
  const apiError = createError.internalError('알 수 없는 오류가 발생했습니다.')
  return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode })
}

/**
 * 요청 본문 파싱 및 검증
 */
export async function parseRequestBody<T>(
  req: NextRequest,
  validator?: (body: unknown) => body is T
): Promise<T> {
  try {
    // Content-Length 확인 (10MB 제한)
    const contentLength = req.headers.get('content-length')
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    
    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      throw createError.invalidRequest('요청 크기가 너무 큽니다. (최대 10MB)')
    }
    
    const body = await req.json()
    
    if (validator && !validator(body)) {
      throw createError.invalidRequest('요청 데이터가 올바르지 않습니다.')
    }
    
    return body as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw createError.invalidRequest('요청 본문 파싱에 실패했습니다.')
  }
}