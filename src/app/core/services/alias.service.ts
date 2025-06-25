import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AliasService {
  private readonly STORAGE_KEY = 'minutemail_current_alias';
  
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
    
    const alias = `${adj1}-${adj2}-${animal}-${number}@minutemail.co`;
    this.setCurrentAlias(alias);
    return alias;
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
}