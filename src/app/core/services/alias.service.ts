import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AliasService {
  private readonly STORAGE_KEY = 'minutemail_current_alias';
  private readonly apiService = inject(ApiService);

  private readonly adjectives = [
    'warm', 'cool', 'bright', 'swift', 'gentle', 'bold', 'calm', 'wild',
    'sunny', 'misty', 'sharp', 'smooth', 'quiet', 'loud', 'soft', 'hard',
    'light', 'dark', 'fresh', 'old', 'new', 'fast', 'slow', 'big', 'small',
    'happy', 'sad', 'angry', 'peaceful', 'stormy', 'clear', 'cloudy', 'windy'
  ];

  private readonly animals = [
    'eagle', 'falcon', 'hawk', 'owl', 'robin', 'sparrow', 'dove', 'raven',
    'wolf', 'fox', 'bear', 'deer', 'rabbit', 'squirrel', 'mouse', 'cat',
    'dog', 'horse', 'cow', 'pig', 'sheep', 'goat', 'duck', 'goose',
    'fish', 'shark', 'whale', 'dolphin', 'seal', 'turtle', 'frog', 'snake'
  ];

  generateRandomAlias(): string {
    const adj1 = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const adj2 = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const animal = this.animals[Math.floor(Math.random() * this.animals.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    return `${adj1}-${adj2}-${animal}-${number}@minutemail.co`;
  }

  /**
   * Generate a new alias and register it with the API
   */
  generateAndRegisterAlias(): Observable<{ alias: string; ttl?: number }> {
    const newAlias = this.generateRandomAlias();
    const aliasName = this.extractAliasFromEmail(newAlias);

    return this.apiService.registerMail(aliasName).pipe(
      map(response => {
        // Store the alias after successful registration
        this.setCurrentAlias(newAlias);
        return {
          alias: newAlias,
          ttl: response.ttl
        };
      }),
      catchError(error => {
        console.error('Failed to register alias:', error);
        // Fallback: still generate the alias locally even if registration fails
        this.setCurrentAlias(newAlias);
        return of({
          alias: newAlias,
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
