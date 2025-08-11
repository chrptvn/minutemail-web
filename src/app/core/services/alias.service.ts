import { Injectable, inject } from '@angular/core';
import { MailBoxService } from './mail-box.service';
import {Observable, tap} from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AliasService {
  private readonly STORAGE_KEY = 'minutemail_current_alias';
  private readonly apiService = inject(MailBoxService);

  /**
   * Generate a new alias and register it with the API using session ID as password
   */
  generateAndRegisterAlias(domain = 'minutemail.cc'): Observable<{ alias: string; expireAt: Date }> {

    return this.apiService.createMailBox(domain).pipe(
      tap(response => this.setCurrentAlias(`${response.email}`)),
      map(response => {
        return {
          alias: response.email,
          expireAt: new Date(response.expireAt)
        };
      })
    );
  }

  getCurrentAlias(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.STORAGE_KEY);
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

  /**
   * Extract domain from email address
   */
  extractDomainFromEmail(email: string): string {
    return email.split('@')[1] || 'minutemail.cc';
  }

  /**
   * Get full email address from current alias
   */
  getCurrentFullEmail(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.STORAGE_KEY);
    }
    return null;
  }
}
