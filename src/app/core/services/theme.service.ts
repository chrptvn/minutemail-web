import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'minutemail_theme';
  
  isDarkMode = signal(this.getInitialTheme());
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Apply theme immediately on service creation
    this.applyTheme();
    
    // Listen for system theme changes only in browser
    if (this.isBrowser) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only update if no user preference is saved
        const saved = this.getSavedTheme();
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
    if (!this.isBrowser) {
      return true; // Default to dark mode for SSR
    }

    const saved = this.getSavedTheme();
    if (saved !== null) {
      return saved === 'dark';
    }

    // Check system preference if no saved theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }

    // Default to light mode if no preference is set
    return false;
  }

  private getSavedTheme(): string | null {
    if (!this.isBrowser) return null;
    
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  }

  private applyTheme(): void {
    if (!this.isBrowser) return;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      const html = document.documentElement;
      const body = document.body;
      
      if (this.isDarkMode()) {
        html.classList.add('dark');
        body.classList.add('dark');
      } else {
        html.classList.remove('dark');
        body.classList.remove('dark');
      }
    });
  }

  private saveTheme(): void {
    if (!this.isBrowser) return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, this.isDarkMode() ? 'dark' : 'light');
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }
}