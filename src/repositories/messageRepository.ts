import { supabase } from '@/lib/supabase'
import { BaseRepository } from './baseRepository'
import type { Message, MessageInsert } from '@/types/database'

export class MessageRepository extends BaseRepository {
  constructor() {
    super('messages')
  }

  /**
   * 메시지 저장
   */
  async create(data: MessageInsert): Promise<Message | null> {
    const { data: message, error } = await supabase
      .from('messages')
      .insert([data])
      .select()
      .single()

    if (error) {
      this.handleError('create', error)
    }

    return this.checkResult(message, 'create')
  }

  /**
   * 세션의 메시지 목록 조회
   */
  async findBySessionId(
    sessionId: string, 
    options?: {
      limit?: number
      ascending?: boolean
    }
  ): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: options?.ascending ?? true })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      this.debug('Messages fetch warning:', error)
      return []
    }

    return data || []
  }

  /**
   * 최근 메시지 조회 (역순)
   */
  async findRecentBySessionId(
    sessionId: string, 
    limit: number = 10
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      this.debug('Recent messages fetch warning:', error)
      return []
    }

    return data?.reverse() || []
  }

  /**
   * 특정 phase의 메시지만 조회
   */
  async findByPhase(
    sessionId: string,
    phase: 'GATHERING_INFO' | 'ANALYZING' | 'READY',
    options?: {
      limit?: number
      ascending?: boolean
    }
  ): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .eq('phase', phase)
      .order('created_at', { ascending: options?.ascending ?? true })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      this.debug('Messages by phase fetch warning:', error)
      return []
    }

    return data || []
  }

  /**
   * QA 단계의 메시지만 조회 (READY phase)
   */
  async findQAMessages(sessionId: string): Promise<Message[]> {
    return this.findByPhase(sessionId, 'READY')
  }

  /**
   * 정보 수집 단계의 최근 메시지 조회
   */
  async findRecentGatheringMessages(
    sessionId: string,
    limit: number = 20
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .eq('phase', 'GATHERING_INFO')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      this.debug('Recent gathering messages fetch warning:', error)
      return []
    }

    return data?.reverse() || []
  }

  /**
   * 대화 히스토리를 문자열로 포맷팅
   */
  formatConversationHistory(messages: Message[]): string {
    return messages
      .filter((msg) => msg.content != null) // null/undefined 체크
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n')
  }
}

export const messageRepository = new MessageRepository()