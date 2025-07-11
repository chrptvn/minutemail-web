import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

declare var Keycloak: any;

export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public keycloak: any; // Make public so components can check if initialized
  private isBrowser: boolean;

  // Reactive state
  isAuthenticated = signal(false);
  userProfile = signal<UserProfile | null>(null);

  private authSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.authSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async initKeycloak(): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }

    // If already initialized, just return current auth state
    if (this.keycloak) {
      console.log('Keycloak already initialized, returning current state:', this.keycloak.authenticated);
      return this.keycloak.authenticated || false;
    }

    try {
      // Dynamically import Keycloak only in browser
      const KeycloakModule = await import('keycloak-js');
      const KeycloakConstructor = KeycloakModule.default;

      this.keycloak = new KeycloakConstructor({
        url: 'https://keycloak.minutemail.co',
        realm: 'minutemail',
        clientId: 'minutemail-web'
      } as any);

      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: true,
        silentCheckSsoFallback: true,
        pkceMethod: 'S256',
        enableLogging: true,
        checkLoginIframeInterval: 5,
        // These options help with session restoration on page refresh
        flow: 'standard',
        responseMode: 'fragment',
        // Try to restore session from stored tokens
        token: this.getStoredToken(),
        refreshToken: this.getStoredRefreshToken(),
        idToken: this.getStoredIdToken()
      });

      console.log('Keycloak initialized, authenticated:', authenticated);
      console.log('Keycloak token:', this.keycloak.token ? 'present' : 'not present');

      if (authenticated) {
        // Store tokens for session restoration
        this.storeTokens();
        await this.loadUserProfile();
      } else {
        // Clear any stale tokens
        this.clearStoredTokens();
      }

      this.isAuthenticated.set(authenticated);
      this.authSubject.next(authenticated);

      // Set up token refresh
      this.setupTokenRefresh();

      // Set up event listeners for auth state changes
      this.keycloak.onAuthSuccess = () => {
        console.log('Auth success event');
        this.storeTokens();
        this.isAuthenticated.set(true);
        this.authSubject.next(true);
        this.loadUserProfile();
      };

      this.keycloak.onAuthError = () => {
        console.log('Auth error event');
        this.clearStoredTokens();
        this.isAuthenticated.set(false);
        this.authSubject.next(false);
        this.userProfile.set(null);
      };

      this.keycloak.onAuthLogout = () => {
        console.log('Auth logout event');
        this.clearStoredTokens();
        this.isAuthenticated.set(false);
        this.authSubject.next(false);
        this.userProfile.set(null);
      };

      // Set up token expired handler
      this.keycloak.onTokenExpired = () => {
        console.log('Token expired, attempting refresh');
        this.keycloak.updateToken(30).then((refreshed: boolean) => {
          if (refreshed) {
            console.log('Token refreshed successfully');
            this.storeTokens();
          } else {
            console.log('Token still valid');
          }
        }).catch(() => {
          console.log('Failed to refresh token, logging out');
          this.logout();
        });
      };

      // Set up token refresh success handler
      this.keycloak.onAuthRefreshSuccess = () => {
        console.log('Token refresh success');
        this.storeTokens();
      };

      // Set up token refresh error handler
      this.keycloak.onAuthRefreshError = () => {
        console.log('Token refresh error, clearing session');
        this.clearStoredTokens();
        this.logout();
      };

      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      this.clearStoredTokens();
      return false;
    }
  }

  private getStoredToken(): string | undefined {
    if (!this.isBrowser) return undefined;
    try {
      return sessionStorage.getItem('kc-token') || undefined;
    } catch {
      return undefined;
    }
  }

  private getStoredRefreshToken(): string | undefined {
    if (!this.isBrowser) return undefined;
    try {
      return sessionStorage.getItem('kc-refresh-token') || undefined;
    } catch {
      return undefined;
    }
  }

  private getStoredIdToken(): string | undefined {
    if (!this.isBrowser) return undefined;
    try {
      return sessionStorage.getItem('kc-id-token') || undefined;
    } catch {
      return undefined;
    }
  }

  private storeTokens(): void {
    if (!this.isBrowser || !this.keycloak) return;
    
    try {
      if (this.keycloak.token) {
        sessionStorage.setItem('kc-token', this.keycloak.token);
      }
      if (this.keycloak.refreshToken) {
        sessionStorage.setItem('kc-refresh-token', this.keycloak.refreshToken);
      }
      if (this.keycloak.idToken) {
        sessionStorage.setItem('kc-id-token', this.keycloak.idToken);
      }
      console.log('Tokens stored in sessionStorage');
    } catch (error) {
      console.warn('Failed to store tokens:', error);
    }
  }

  private clearStoredTokens(): void {
    if (!this.isBrowser) return;
    
    try {
      sessionStorage.removeItem('kc-token');
      sessionStorage.removeItem('kc-refresh-token');
      sessionStorage.removeItem('kc-id-token');
      console.log('Tokens cleared from sessionStorage');
    } catch (error) {
      console.warn('Failed to clear tokens:', error);
    }
  }
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
        silentCheckSsoFallback: false,
        pkceMethod: 'S256',
        enableLogging: true,
        checkLoginIframeInterval: 5
      });

      console.log('Keycloak initialized, authenticated:', authenticated);
      console.log('Keycloak token:', this.keycloak.token ? 'present' : 'not present');

      if (authenticated) {
        await this.loadUserProfile();
      }

      this.isAuthenticated.set(authenticated);
      this.authSubject.next(authenticated);

      // Set up token refresh
      this.setupTokenRefresh();

      // Set up event listeners for auth state changes
      this.keycloak.onAuthSuccess = () => {
        console.log('Auth success event');
        this.isAuthenticated.set(true);
        this.authSubject.next(true);
        this.loadUserProfile();
      };

      this.keycloak.onAuthError = () => {
        console.log('Auth error event');
        this.isAuthenticated.set(false);
        this.authSubject.next(false);
        this.userProfile.set(null);
      };

      this.keycloak.onAuthLogout = () => {
        console.log('Auth logout event');
        this.isAuthenticated.set(false);
        this.authSubject.next(false);
        this.userProfile.set(null);
      };

      // Set up token expired handler
      this.keycloak.onTokenExpired = () => {
        console.log('Token expired, attempting refresh');
        this.keycloak.updateToken(30).then((refreshed: boolean) => {
          if (refreshed) {
            console.log('Token refreshed successfully');
          } else {
            console.log('Token still valid');
          }
        }).catch(() => {
          console.log('Failed to refresh token, logging out');
          this.logout();
        });
      };
      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      return false;
    }
  }

  private async loadUserProfile(): Promise<void> {
    if (!this.keycloak) return;

    try {
      const profile = await this.keycloak.loadUserProfile();
      console.log('Loaded user profile:', profile);
      this.userProfile.set({
        id: profile.id,
        username: profile.username,
        email: profile.email
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  private setupTokenRefresh(): void {
    if (!this.keycloak) return;

    // Refresh token more frequently and with better error handling
    setInterval(() => {
      if (this.keycloak.authenticated) {
        this.keycloak.updateToken(30).then((refreshed: boolean) => {
          if (refreshed) {
            console.log('Token refreshed');
            this.storeTokens();
            // Ensure auth state is still correct after refresh
            if (this.keycloak.authenticated !== this.isAuthenticated()) {
              this.isAuthenticated.set(this.keycloak.authenticated || false);
              this.authSubject.next(this.keycloak.authenticated || false);
            }
          } else {
            console.log('Token still valid');
          }
        }).catch(() => {
          console.log('Failed to refresh token, logging out');
          this.logout();
        });
      }
    }, 60000); // Check every minute
  }

  login(): void {
    if (!this.isBrowser || !this.keycloak) return;

    console.log('Initiating login');
    this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  register(): void {
    if (!this.isBrowser || !this.keycloak) return;

    console.log('Initiating registration');
    this.keycloak.register({
      redirectUri: window.location.origin
    });
  }

  logout(): void {
    if (!this.isBrowser || !this.keycloak) return;

    console.log('Initiating logout');
    this.clearStoredTokens();
    this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  getToken(): string | null {
    // Check if token is valid before returning it
    if (!this.keycloak || !this.keycloak.authenticated) {
      return null;
    }
    
    // If token is expired, try to refresh it
    if (this.keycloak.isTokenExpired()) {
      console.log('Token expired, attempting refresh in getToken');
      this.keycloak.updateToken(30).catch(() => {
        console.log('Token refresh failed in getToken');
          this.storeTokens();
        this.logout();
      });
      return null;
    }
    
    const token = this.keycloak.token || null;
    console.log('Getting token:', token ? 'present' : 'not present');
    return token;
  }

  isTokenExpired(): boolean {
    const expired = this.keycloak?.isTokenExpired() || true;
    console.log('Token expired:', expired);
    return expired;
  }

  hasRole(role: string): boolean {
    return this.keycloak?.hasRealmRole(role) || false;
  }

  getUserDisplayName(): string {
    const profile = this.userProfile();
    if (!profile) return '';

    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }

    return profile.username || profile.email || '';
  }

  getUserInitials(): string {
    const profile = this.userProfile();
    if (!profile) return '';

    if (profile.firstName && profile.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }

    if (profile.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }

    if (profile.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }

    return '';
  }
}
