import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'minutemail_theme';
  
  isDarkMode = signal(this.getInitialTheme());

  constructor() {
    // Apply theme immediately on service creation
    this.applyTheme();
    
    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only update if no user preference is saved
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved === null) {
          this.isDarkMode.set(e.matches);
          this.applyTheme();
        }
      });
    }
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

    // Default to dark mode (as specified in requirements)
    return true;
  }

  private applyTheme(): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    const body = document.body;
    
    if (this.isDarkMode()) {
      html.classList.add('dark');
      body.classList.add('dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
    }
  }

  private saveTheme(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.STORAGE_KEY, this.isDarkMode() ? 'dark' : 'light');
  }
}