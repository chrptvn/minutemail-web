import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, timer, switchMap, catchError, of, takeUntil, Subject } from 'rxjs';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly keycloak: Keycloak = inject(Keycloak);
  private readonly destroy$ = new Subject<void>();
  
  private readonly authStatus$ = new BehaviorSubject<boolean>(false);
  private readonly tokenRefreshInterval = 30000; // Check every 30 seconds
  private readonly tokenRefreshThreshold = 60; // Refresh if token expires in less than 60 seconds

  constructor() {
    this.initializeTokenRefresh();
  }

  /**
   * Get authentication status as observable
   */
  getAuthStatus() {
    return this.authStatus$.asObservable();
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!this.keycloak.authenticated;
  }

  /**
   * Initialize automatic token refresh
   */
  private initializeTokenRefresh() {
    // Update auth status initially
    this.authStatus$.next(this.isAuthenticated());

    // Set up periodic token refresh check
    timer(this.tokenRefreshInterval, this.tokenRefreshInterval)
      .pipe(
        switchMap(() => this.checkAndRefreshToken()),
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Token refresh error:', error);
          return of(false);
        })
      )
      .subscribe(refreshed => {
        // Update auth status
        this.authStatus$.next(this.isAuthenticated());
        
        if (refreshed) {
          console.log('Token refreshed successfully');
        }
      });
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  private async checkAndRefreshToken(): Promise<boolean> {
    if (!this.keycloak.authenticated) {
      return false;
    }

    try {
      // Check if token is about to expire
      const tokenParsed = this.keycloak.tokenParsed;
      if (!tokenParsed || !tokenParsed.exp) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const tokenExpiry = tokenParsed.exp;
      const timeUntilExpiry = tokenExpiry - now;

      // If token expires in less than threshold seconds, refresh it
      if (timeUntilExpiry < this.tokenRefreshThreshold) {
        console.log(`Token expires in ${timeUntilExpiry} seconds, refreshing...`);
        
        const refreshed = await this.keycloak.updateToken(this.tokenRefreshThreshold);
        
        if (refreshed) {
          console.log('Token refreshed successfully');
          return true;
        } else {
          console.log('Token is still valid, no refresh needed');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking/refreshing token:', error);
      
      // If refresh fails, the user might need to re-authenticate
      if (error instanceof Error && error.message.includes('Failed to refresh token')) {
        console.warn('Token refresh failed, user may need to re-authenticate');
        this.authStatus$.next(false);
      }
      
      return false;
    }
  }

  /**
   * Manually refresh token
   */
  async refreshToken(): Promise<boolean> {
    if (!this.keycloak.authenticated) {
      return false;
    }

    try {
      const refreshed = await this.keycloak.updateToken(0); // Force refresh
      this.authStatus$.next(this.isAuthenticated());
      return refreshed;
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      this.authStatus$.next(false);
      return false;
    }
  }

  /**
   * Get current token
   */
  getToken(): string | undefined {
    return this.keycloak.token;
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(): Date | null {
    const tokenParsed = this.keycloak.tokenParsed;
    if (!tokenParsed || !tokenParsed.exp) {
      return null;
    }
    return new Date(tokenParsed.exp * 1000);
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

  /**
   * Login user
   */
  async login(redirectUri?: string): Promise<void> {
    try {
      await this.keycloak.login({ redirectUri });
      this.authStatus$.next(this.isAuthenticated());
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register user
   */
  async register(redirectUri?: string): Promise<void> {
    try {
      await this.keycloak.register({ redirectUri });
      this.authStatus$.next(this.isAuthenticated());
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.keycloak.logout();
      this.authStatus$.next(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}