import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'minutemail_theme';
  
  isDarkMode = signal(this.getInitialTheme());

  constructor() {
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode.update(current => !current);
    this.applyTheme();
    this.saveTheme();
  }

  private getInitialTheme(): boolean {
    if (typeof window === 'undefined') {
      return true; // Default to dark mode for SSR
    }

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved !== null) {
      return saved === 'dark';
    }

    // Default to dark mode or system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    if (this.isDarkMode()) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  private saveTheme(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.STORAGE_KEY, this.isDarkMode() ? 'dark' : 'light');
  }
}