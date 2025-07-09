import {Injectable, signal, Inject, PLATFORM_ID, WritableSignal} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'minutemail_theme';

  isDarkMode: WritableSignal<boolean> = signal(false);
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Listen for system theme changes only in the browser if no user preference
    if (this.isBrowser) {
      this.isDarkMode.set(this.getInitialTheme())
      this.applyThemeImmediate();
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
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
    this.saveTheme();
    this.applyThemeImmediate();
  }

  private getInitialTheme(): boolean {
    if (!this.isBrowser) {
      return true;
    }

    const saved = this.getSavedTheme();
    if (saved !== null) {
      return saved === 'dark';
    }

    // If no saved preference, default to dark
    return true;
  }

  private getSavedTheme(): string | null {
    if (!this.isBrowser) return null;

    try {
      const localStorageTheme = localStorage.getItem(this.STORAGE_KEY);
      if (localStorageTheme) {
        return localStorageTheme; // 🩹 fixed: no removal
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

    // Prevent transition flashes
    html.classList.add('no-transition');
    body.classList.add('no-transition');

    if (this.isDarkMode()) {
      html.classList.add('dark');
      body.classList.add('dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
    }

    // Force reflow to apply styles immediately
    html.offsetHeight;

    requestAnimationFrame(() => {
      html.classList.remove('no-transition');
      body.classList.remove('no-transition');
    });
  }

  private saveTheme(): void {
    if (!this.isBrowser) return;

    const themeValue = this.isDarkMode() ? 'dark' : 'light';

    try {
      localStorage.setItem(this.STORAGE_KEY, themeValue);
      // Also save to cookie for SSR
      const expires = new Date();
      expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
      document.cookie = `minutemail_theme=${themeValue};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }
}
