import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { SessionService } from './session.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AliasService {
  private readonly STORAGE_KEY = 'minutemail_current_alias';
  private readonly apiService = inject(ApiService);
  private readonly sessionService = inject(SessionService);

  /**
   * Generate a new alias and register it with the API using session ID as password
   */
  generateAndRegisterAlias(): Observable<{ alias?: string; ttl?: number }> {
    // Get or create session ID to use as password
    const sessionId = this.sessionService.getOrCreateSessionId();

    return this.apiService.createMailBox(sessionId).pipe(
      map(response => {
        this.setCurrentAlias(`${response.name}@minutemail.co`);
        return {
          alias: `${response.name}@minutemail.co`,
          ttl: response.ttl
        };
      }),
      catchError(error => {
        console.error('Failed to register alias:', error);

        return of({
          alias: undefined,
          ttl: undefined
        });
      })
    );
  }

  getCurrentAlias(): string | null {
    if (typeof window !== 'undefined') {
      const mail = sessionStorage.getItem(this.STORAGE_KEY);
      if (mail) {
        return mail.split('@')[0];
      } else {
        return null;
      }
    }
    return null;
  }

  setCurrentAlias(alias: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.STORAGE_KEY, alias);
    }
  }

  clearCurrentAlias(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  extractAliasFromEmail(email: string): string {
    return email.split('@')[0];
  }
}