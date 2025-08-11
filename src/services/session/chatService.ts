import { sessionRepository } from '@/repositories/sessionRepository'
import { messageRepository } from '@/repositories/messageRepository'
import { infoExtractorService } from '../saju/infoExtractor'
import { sajuAnalyzerService } from '../saju/analyzer'
import { STATUS_MESSAGES, INITIAL_GREETING_MESSAGE } from '@/constants/hokidongza'
import type { Session, SessionUpdate } from '@/types/database'

export interface ChatResponse {
  message: string
  status?: 'GATHERING_INFO' | 'ANALYZING' | 'READY'
}

/**
 * 채팅 세션 관리 서비스
 */
export class ChatService {
  /**
   * 메시지 처리 메인 로직
   */
  async processMessage(
    sessionId: string,
    userMessage: string
  ): Promise<ChatResponse> {
    // 1. 세션 조회
    const session = await sessionRepository.findById(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    // 2. 사용자 메시지 저장 (현재 세션 상태를 phase로 저장)
    await messageRepository.create({
      session_id: sessionId,
      role: 'user',
      content: userMessage,
      phase: session.status
    })

    // 3. 상태별 처리
    let response: ChatResponse
    
    switch (session.status) {
      case 'GATHERING_INFO':
        response = await this.handleGatheringInfo(session, userMessage)
        break
      case 'ANALYZING':
        response = {
          message: STATUS_MESSAGES.ANALYZING,
          status: 'ANALYZING'
        }
        break
      case 'READY':
        response = await this.handleQuestionAnswering(session, userMessage)
        break
      default:
        throw new Error('Invalid session status')
    }

    // 4. 봇 응답 저장 (응답 시점의 상태를 phase로 저장)
    await messageRepository.create({
      session_id: sessionId,
      role: 'assistant',
      content: response.message,
      phase: response.status || session.status
    })

    return response
  }

  /**
   * 정보 수집 단계 처리
   */
  private async handleGatheringInfo(
    session: Session,
    userMessage: string
  ): Promise<ChatResponse> {
    try {
      // 1. GATHERING_INFO phase의 최근 대화 가져오기
      // DB에서 phase로 필터링하여 효율적으로 조회
      const recentMessages = await messageRepository.findRecentGatheringMessages(session.id, 20)
      const conversationHistory = messageRepository.formatConversationHistory(recentMessages)

      // 2. 정보 추출
      const extractedInfo = await infoExtractorService.extractInfo(
        conversationHistory,
        userMessage
      )

      // 3. 세션 업데이트
      const updateData: SessionUpdate = {}
      if (extractedInfo.name) updateData.user_name = extractedInfo.name
      if (extractedInfo.birth_date) updateData.birth_date = extractedInfo.birth_date
      if (extractedInfo.birth_time) updateData.birth_time = extractedInfo.birth_time
      if (extractedInfo.gender) updateData.gender = extractedInfo.gender

      let updatedSession = session
      if (Object.keys(updateData).length > 0) {
        const updated = await sessionRepository.update(session.id, updateData)
        if (updated) updatedSession = updated
      }

      // 4. 정보 완전성 확인
      const missingInfo = infoExtractorService.checkMissingInfo(updatedSession)

      if (missingInfo.hasAll) {
        // 모든 정보 수집 완료
        await sessionRepository.updateStatus(session.id, 'ANALYZING')
        
        // 비동기로 분석 시작
        this.startBackgroundAnalysis(session.id, updatedSession)
          .catch(console.error)

        return {
          message: STATUS_MESSAGES.ALL_INFO_COLLECTED,
          status: 'ANALYZING'
        }
      } else {
        // 추가 정보 필요
        const collectedInfo = infoExtractorService.formatCollectedInfo(updatedSession)
        const message = infoExtractorService.buildInfoGatheringResponse(
          collectedInfo,
          missingInfo.fields
        )

        return {
          message,
          status: 'GATHERING_INFO'
        }
      }
    } catch (error) {
      console.error('Error in handleGatheringInfo:', error)
      return {
        message: STATUS_MESSAGES.ERROR_RETRY,
        status: 'GATHERING_INFO'
      }
    }
  }

  /**
   * 질의응답 단계 처리
   */
  private async handleQuestionAnswering(
    session: Session,
    userMessage: string
  ): Promise<ChatResponse> {
    try {
      // 1. READY phase의 대화만 가져오기 (QA 컨텍스트)
      // DB에서 phase로 필터링하여 정보 수집 단계 제외
      const messages = await messageRepository.findQAMessages(session.id)
      const conversationHistory = messageRepository.formatConversationHistory(messages)

      // 2. 저장된 분석 결과와 함께 답변 생성
      const answer = await sajuAnalyzerService.answerQuestion(
        session,
        conversationHistory,
        userMessage,
        session.analysis_result
      )

      if (!answer) {
        return {
          message: STATUS_MESSAGES.ERROR_RESPONSE,
          status: 'READY'
        }
      }

      return {
        message: answer,
        status: 'READY'
      }
    } catch (error) {
      console.error('Error in handleQuestionAnswering:', error)
      return {
        message: STATUS_MESSAGES.ERROR_RESPONSE_CREATION,
        status: 'READY'
      }
    }
  }

  /**
   * 백그라운드 분석 시작
   */
  private async startBackgroundAnalysis(
    sessionId: string,
    userInfo: Session
  ): Promise<void> {
    try {
      // 1. 사주 분석 수행
      const analysisResult = await sajuAnalyzerService.performInitialAnalysis(userInfo)
      
      if (!analysisResult) {
        throw new Error('Analysis failed')
      }

      console.log('Initial analysis completed:', analysisResult)

      // 2. 분석 결과를 세션에 저장하고 상태를 READY로 변경
      await sessionRepository.update(sessionId, {
        status: 'READY',
        analysis_result: analysisResult
      })

      // 3. 완료 메시지 저장 (READY phase로 표시)
      await messageRepository.create({
        session_id: sessionId,
        role: 'assistant',
        content: STATUS_MESSAGES.ANALYSIS_COMPLETE,
        phase: 'READY'
      })

      console.log('Session ready for Q&A:', sessionId)
    } catch (error) {
      console.error('Background analysis error:', error)
      
      // 분석 실패 시 세션을 다시 GATHERING_INFO 상태로 복구
      await sessionRepository.updateStatus(sessionId, 'GATHERING_INFO')
      
      // 오류 메시지 저장
      await messageRepository.create({
        session_id: sessionId,
        role: 'assistant',
        content: STATUS_MESSAGES.ERROR_ANALYSIS,
        phase: 'GATHERING_INFO'
      })
    }
  }

  /**
   * 새 세션 생성
   */
  async createSession(): Promise<{ sessionId: string; initialMessage: string }> {
    const session = await sessionRepository.create()
    
    if (!session) {
      throw new Error('Failed to create session')
    }

    return {
      sessionId: session.id,
      initialMessage: INITIAL_GREETING_MESSAGE
    }
  }
}

export const chatService = new ChatService()