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
        clientId: 'minutemail-web',
        // Add CORS and cookie configuration
        enableCors: true
      } as any);

      const initOptions: any = {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false, // Disable iframe checks to avoid cross-site issues
        silentCheckSsoFallback: false,
        pkceMethod: 'S256',
        enableLogging: true,
        checkLoginIframeInterval: 5,
        // Add cookie configuration
        cookieSameSite: 'None',
        cookieSecure: true,
        // Reduce token refresh frequency to minimize cross-site requests
        tokenRefreshInterval: 300 // 5 minutes
      };

      // restore tokens from localStorage if present
      const storedToken = localStorage.getItem('kc_token');
      const storedRefresh = localStorage.getItem('kc_refreshToken');
      const storedId = localStorage.getItem('kc_idToken');
      if (storedToken)   initOptions.token = storedToken;
      if (storedRefresh) initOptions.refreshToken = storedRefresh;
      if (storedId)      initOptions.idToken = storedId;

      const authenticated = await this.keycloak.init(initOptions);

      console.log('Keycloak initialized, authenticated:', authenticated);

      if (authenticated) {
        // persist tokens
        localStorage.setItem('kc_token', this.keycloak.token);
        localStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
        localStorage.setItem('kc_idToken', this.keycloak.idToken);

        await this.loadUserProfile();
      }

      this.isAuthenticated.set(authenticated);
      this.authSubject.next(authenticated);

      this.setupTokenRefresh();

      this.keycloak.onAuthSuccess = () => {
        this.isAuthenticated.set(true);
        this.authSubject.next(true);
        this.loadUserProfile();
      };

      this.keycloak.onAuthError = () => {
        this.clearStoredTokens();
        this.isAuthenticated.set(false);
        this.authSubject.next(false);
        this.userProfile.set(null);
      };

      this.keycloak.onAuthLogout = () => {
        this.clearStoredTokens();
        this.isAuthenticated.set(false);
        this.authSubject.next(false);
        this.userProfile.set(null);
      };

      this.keycloak.onTokenExpired = () => {
        this.keycloak.updateToken(30).then((refreshed: boolean) => {
          if (refreshed) {
            localStorage.setItem('kc_token', this.keycloak.token);
            localStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
            localStorage.setItem('kc_idToken', this.keycloak.idToken);
          } else {
            console.log('Token still valid');
          }
        }).catch(() => {
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

    // Increase refresh interval to reduce cross-site requests
    setInterval(() => {
      if (this.keycloak.authenticated) {
        // Increase minimum validity to 5 minutes to reduce refresh frequency
        this.keycloak.updateToken(300).then((refreshed: boolean) => {
          if (refreshed) {
            // update persisted tokens
            localStorage.setItem('kc_token', this.keycloak.token);
            localStorage.setItem('kc_refreshToken', this.keycloak.refreshToken);
            localStorage.setItem('kc_idToken', this.keycloak.idToken);
            // sync reactive state
            if (this.keycloak.authenticated !== this.isAuthenticated()) {
              this.isAuthenticated.set(this.keycloak.authenticated);
              this.authSubject.next(this.keycloak.authenticated);
            }
          }
        }).catch(() => {
          this.logout();
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
      return null;
    }
    if (this.keycloak.isTokenExpired()) {
      this.keycloak.updateToken(30).catch(() => this.logout());
      return null;
    }
    return this.keycloak.token;
  }

  isTokenExpired(): boolean {
    return this.keycloak?.isTokenExpired() ?? true;
  }
}
