import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly COOKIE_NAME = 'minutemail_theme';
  private readonly STORAGE_KEY = 'minutemail_theme'; // Fallback for localStorage
  
  isDarkMode = signal(this.getInitialTheme());
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cookieService: CookieService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Apply theme immediately on service creation without transitions
    this.applyThemeImmediate();
    
    // Listen for system theme changes only in browser
    if (this.isBrowser) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only update if no user preference is saved
        const saved = this.getSavedTheme();
        if (saved === null) {
          this.isDarkMode.set(e.matches);
          this.applyThemeImmediate();
        }
      });
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update(current => !current);
    this.applyThemeImmediate();
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

    // Default to dark mode (as specified in requirements)
    return true;
  }

  private getSavedTheme(): string | null {
    if (!this.isBrowser) return null;

    // Try cookie first (preferred method)
    const cookieTheme = this.cookieService.getCookie(this.COOKIE_NAME);
    if (cookieTheme) {
      return cookieTheme;
    }

    // Fallback to localStorage for existing users
    try {
      const localStorageTheme = localStorage.getItem(this.STORAGE_KEY);
      if (localStorageTheme) {
        // Migrate from localStorage to cookie
        this.cookieService.setCookie(this.COOKIE_NAME, localStorageTheme, 365);
        localStorage.removeItem(this.STORAGE_KEY);
        return localStorageTheme;
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }

    return null;
  }

  private applyThemeImmediate(): void {
    if (!this.isBrowser) return;

    const html = document.documentElement;
    const body = document.body;
    
    // Add no-transition class to prevent flashing
    html.classList.add('no-transition');
    body.classList.add('no-transition');
    
    // Remove existing classes first to prevent conflicts
    html.classList.remove('dark');
    body.classList.remove('dark');
    
    if (this.isDarkMode()) {
      html.classList.add('dark');
      body.classList.add('dark');
    }
    
    // Force a style recalculation to ensure immediate application
    html.offsetHeight;
    
    // Remove no-transition class after ensuring styles are applied
    requestAnimationFrame(() => {
      html.classList.remove('no-transition');
      body.classList.remove('no-transition');
    });
  }

  private saveTheme(): void {
    if (!this.isBrowser) return;
    
    const themeValue = this.isDarkMode() ? 'dark' : 'light';
    
    // Save to cookie (primary method)
    this.cookieService.setCookie(this.COOKIE_NAME, themeValue, 365);
    
    // Also save to localStorage as fallback for browsers with cookies disabled
    try {
      localStorage.setItem(this.STORAGE_KEY, themeValue);
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }
}