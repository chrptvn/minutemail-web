import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Set a cookie
   */
  setCookie(name: string, value: string, days: number = 365): void {
    if (!this.isBrowser) return;

    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Get a cookie value
   */
  getCookie(name: string): string | null {
    if (!this.isBrowser) return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    
    return null;
  }

  /**
   * Delete a cookie
   */
  deleteCookie(name: string): void {
    if (!this.isBrowser) return;
    
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
  }

  /**
   * Check if cookies are available
   */
  areCookiesAvailable(): boolean {
    if (!this.isBrowser) return false;
    
    try {
      const testCookie = 'test_cookie';
      this.setCookie(testCookie, 'test', 1);
      const result = this.getCookie(testCookie) === 'test';
      this.deleteCookie(testCookie);
      return result;
    } catch {
      return false;
    }
  }
}