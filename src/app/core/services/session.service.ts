import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'minutemail_session_id';
  private sessionId$ = new BehaviorSubject<string | null>(null);

  constructor() {
    // Initialize with existing session ID if available
    const existingSessionId = this.getStoredSessionId();
    if (existingSessionId) {
      this.sessionId$.next(existingSessionId);
    }
  }

  /**
   * Generate a new session ID
   */
  generateSessionId(): string {
    const sessionId = this.createUniqueId();
    this.setSessionId(sessionId);
    return sessionId;
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string | null {
    return this.sessionId$.value;
  }

  /**
   * Get session ID as observable
   */
  getSessionId$(): Observable<string | null> {
    return this.sessionId$.asObservable();
  }

  /**
   * Set a specific session ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId$.next(sessionId);
    this.storeSessionId(sessionId);
  }

  /**
   * Clear the current session ID
   */
  clearSessionId(): void {
    this.sessionId$.next(null);
    this.removeStoredSessionId();
  }

  /**
   * Check if a session ID exists
   */
  hasSessionId(): boolean {
    return this.getSessionId() !== null;
  }

  /**
   * Generate or get existing session ID
   */
  getOrCreateSessionId(): string {
    const existingId = this.getSessionId();
    if (existingId) {
      return existingId;
    }
    return this.generateSessionId();
  }

  private createUniqueId(): string {
    // Generate a unique session ID using timestamp and random values
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    
    return `${timestamp}-${randomPart}-${randomPart2}`;
  }

  private getStoredSessionId(): string | null {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem(this.SESSION_KEY);
      } catch (error) {
        console.warn('SessionStorage not available:', error);
        return null;
      }
    }
    return null;
  }

  private storeSessionId(sessionId: string): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(this.SESSION_KEY, sessionId);
      } catch (error) {
        console.warn('SessionStorage not available:', error);
      }
    }
  }

  private removeStoredSessionId(): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(this.SESSION_KEY);
      } catch (error) {
        console.warn('SessionStorage not available:', error);
      }
    }
  }
}