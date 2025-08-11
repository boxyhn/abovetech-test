import { supabase } from '@/lib/supabase'
import { BaseRepository } from './baseRepository'
import type { Session, SessionInsert, SessionUpdate } from '@/types/database'

export class SessionRepository extends BaseRepository {
  constructor() {
    super('sessions')
  }

  /**
   * 새로운 세션 생성
   */
  async create(data: SessionInsert = {}): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('sessions')
      .insert([data])
      .select()
      .single()

    if (error) {
      this.handleError('create', error)
    }

    return this.checkResult(session, 'create')
  }

  /**
   * ID로 세션 조회
   */
  async findById(id: string): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      this.handleError('findById', error)
    }

    return this.checkResult(session, 'findById')
  }

  /**
   * 세션 정보 업데이트
   */
  async update(id: string, data: SessionUpdate): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('sessions')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      this.handleError('update', error)
    }

    return this.checkResult(session, 'update')
  }

  /**
   * 세션 상태 업데이트
   */
  async updateStatus(
    id: string, 
    status: 'GATHERING_INFO' | 'ANALYZING' | 'READY'
  ): Promise<boolean> {
    const { error } = await supabase
      .from('sessions')
      .update({ status })
      .eq('id', id)

    if (error) {
      this.handleError('updateStatus', error)
    }

    return true
  }

}

export const sessionRepository = new SessionRepository()