import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly SESSION_KEY = 'minutemail_session_id';
  private sessionId$ = new BehaviorSubject<string | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // browser only
      const existing = sessionStorage.getItem(this.SESSION_KEY);
      if (existing) {
        this.sessionId$.next(existing);
      }
    }
  }

  getOrCreateSessionId(): string {
    let id = this.sessionId$.value;
    if (!id) {
      id = this.createUniqueId();
      this.sessionId$.next(id);
      sessionStorage.setItem(this.SESSION_KEY, id);
    }
    return id;
  }

  getSessionId(): string | null {
    return this.sessionId$.value;
  }
  getSessionId$(): Observable<string | null> {
    return this.sessionId$.asObservable();
  }
  clearSessionId(): void {
    this.sessionId$.next(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }

  private createUniqueId(): string {
    const timestamp = Date.now().toString(36);
    const rand1 = Math.random().toString(36).substring(2,15);
    const rand2 = Math.random().toString(36).substring(2,15);
    return `${timestamp}-${rand1}-${rand2}`;
  }
}
