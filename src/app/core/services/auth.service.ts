import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

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
  public keycloak: any;
  private isBrowser: boolean;

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

    try {
      const KeycloakModule = await import('keycloak-js');
      const KeycloakConstructor = KeycloakModule.default;

      this.keycloak = new KeycloakConstructor({
        url: 'https://keycloak.minutemail.co',
        realm: 'minutemail',
        clientId: 'minutemail-web'
      } as any);

      const initOptions: any = {
        onLoad: 'login-required',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        silentCheckSso: false,
        checkLoginIframe: false, // Disable to avoid cross-site issues
        silentCheckSsoFallback: false,
        pkceMethod: 'S256',
        enableLogging: false, // Reduce console noise
        // Increase intervals to reduce cross-site requests
        checkLoginIframeInterval: 300, // 5 minutes instead of 5 seconds
        tokenRefreshInterval: 300 // 5 minutes
      };

      // Restore tokens from localStorage if present
      const storedToken = localStorage.getItem('kc_token');
      const storedRefresh = localStorage.getItem('kc_refreshToken');
      const storedId = localStorage.getItem('kc_idToken');
      if (storedToken) initOptions.token = storedToken;
      if (storedRefresh) initOptions.refreshToken = storedRefresh;
      if (storedId) initOptions.idToken = storedId;

      const authenticated = await this.keycloak.init(initOptions);

      console.log('Keycloak initialized, authenticated:', authenticated);

      if (authenticated) {
        // Persist tokens
        localStorage.setItem('kc_token', this.keycloak.token);
        localStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
        localStorage.setItem('kc_idToken', this.keycloak.idToken);

        await this.loadUserProfile();
      }

      this.isAuthenticated.set(authenticated);
      this.authSubject.next(authenticated);

      this.setupTokenRefresh();

      // Event handlers
      this.keycloak.onAuthSuccess = () => {
        console.log('Keycloak auth success');
        localStorage.setItem('kc_token', this.keycloak.token);
        localStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
        localStorage.setItem('kc_idToken', this.keycloak.idToken);
        this.isAuthenticated.set(true);
        this.authSubject.next(true);
        this.loadUserProfile();
      };

      this.keycloak.onAuthError = (error: any) => {
        console.error('Keycloak auth error:', error);
        this.clearStoredTokens();
        this.isAuthenticated.set(false);
        this.authSubject.next(false);
        this.userProfile.set(null);
      };

      this.keycloak.onAuthLogout = () => {
        console.log('Keycloak auth logout');
        this.clearStoredTokens();
        this.isAuthenticated.set(false);
        this.authSubject.next(false);
        this.userProfile.set(null);
      };

      this.keycloak.onTokenExpired = () => {
        console.log('Keycloak token expired, attempting refresh...');
        this.keycloak.updateToken(300).then((refreshed: boolean) => {
          if (refreshed) {
            console.log('Token refreshed successfully');
            localStorage.setItem('kc_token', this.keycloak.token);
            localStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
            localStorage.setItem('kc_idToken', this.keycloak.idToken);
          } else {
            console.log('Token still valid');
          }
        }).catch((error: unknown) => {
          console.error('Token refresh failed:', error);
          this.logout();
        }) as Promise<boolean>;
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
      this.userProfile.set({
        id: profile.id,
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  private setupTokenRefresh(): void {
    if (!this.keycloak) return;

    // Reduce refresh frequency to minimize cross-site requests
    setInterval(() => {
      if (this.keycloak.authenticated) {
        // Only refresh if token expires within 5 minutes
        this.keycloak.updateToken(300).then((refreshed: boolean) => {
          if (refreshed) {
            console.log('Background token refresh successful');
            localStorage.setItem('kc_token', this.keycloak.token);
            localStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
            localStorage.setItem('kc_idToken', this.keycloak.idToken);

            // Sync reactive state
            if (this.keycloak.authenticated !== this.isAuthenticated()) {
              this.isAuthenticated.set(this.keycloak.authenticated);
              this.authSubject.next(this.keycloak.authenticated);
            }
          }
        }).catch((error: unknown) => {
          console.error('Background token refresh failed:', error);
          // Don't logout immediately on refresh failure - let user continue
          // Only logout if token is actually expired and can't be used
          if (this.keycloak.isTokenExpired()) {
            this.logout();
          }
        });
      }
    }, 300000); // Check every 5 minutes instead of 1 minute
  }

  login(): void {
    if (!this.isBrowser || !this.keycloak) return;
    this.keycloak.login({ redirectUri: window.location.origin });
  }

  register(): void {
    if (!this.isBrowser || !this.keycloak) return;
    this.keycloak.register({ redirectUri: window.location.origin });
  }

  logout(): void {
    if (!this.isBrowser || !this.keycloak) return;
    this.clearStoredTokens();
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  private clearStoredTokens(): void {
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_refreshToken');
    localStorage.removeItem('kc_idToken');
  }

  getToken(): string | null {
    if (!this.keycloak || !this.keycloak.authenticated) {
      return localStorage.getItem('kc_token'); // Fallback to stored token
    }

    // Check if token is expired
    if (this.keycloak.isTokenExpired()) {
      // Try to refresh token synchronously if possible
      this.keycloak.updateToken(30).catch(() => {
        console.warn('Token refresh failed in getToken()');
      });
      return localStorage.getItem('kc_token'); // Return stored token as fallback
    }

    return this.keycloak.token;
  }

  isTokenExpired(): boolean {
    return this.keycloak?.isTokenExpired() ?? true;
  }
}
