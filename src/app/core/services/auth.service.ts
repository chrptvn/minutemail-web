import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private keycloak: any;
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

    try {
      // Dynamically import Keycloak only in browser
      const KeycloakModule = await import('keycloak-js');
      const KeycloakConstructor = KeycloakModule.default;

      this.keycloak = new KeycloakConstructor({
        url: 'https://keycloak.minutemail.co',
        realm: 'minutemail',
        clientId: 'minutemail-web'
      });

      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
        pkceMethod: 'S256'
      });

      if (authenticated) {
        await this.loadUserProfile();
      }

      this.isAuthenticated.set(authenticated);
      this.authSubject.next(authenticated);

      // Set up token refresh
      this.setupTokenRefresh();

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

    // Refresh token every 5 minutes
    setInterval(() => {
      this.keycloak.updateToken(70).then((refreshed: boolean) => {
        if (refreshed) {
          console.log('Token refreshed');
        }
      }).catch(() => {
        console.log('Failed to refresh token');
        this.logout();
      });
    }, 300000); // 5 minutes
  }

  login(): void {
    if (!this.isBrowser || !this.keycloak) return;
    
    this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  register(): void {
    if (!this.isBrowser || !this.keycloak) return;
    
    this.keycloak.register({
      redirectUri: window.location.origin
    });
  }

  logout(): void {
    if (!this.isBrowser || !this.keycloak) return;
    
    this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  getToken(): string | null {
    return this.keycloak?.token || null;
  }

  isTokenExpired(): boolean {
    return this.keycloak?.isTokenExpired() || true;
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