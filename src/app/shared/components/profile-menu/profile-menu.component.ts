import { Component, signal, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss'
})
export class ProfileMenuComponent implements OnInit {
  isOpen = signal(false);
  keycloakReady = signal(false);
  isAuthenticated = signal(false);
  
  private router = inject(Router);
  private keycloakService = inject(KeycloakService);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) {
      return; // Skip Keycloak initialization on server
    }

    try {
      // Wait a bit for Keycloak to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if Keycloak is ready
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      this.isAuthenticated.set(isLoggedIn);
      this.keycloakReady.set(true);
      
      console.log('Keycloak initialized successfully, logged in:', isLoggedIn);
    } catch (error) {
      console.warn('Keycloak initialization error:', error);
      this.keycloakReady.set(false);
      this.isAuthenticated.set(false);
    }
  }

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  async login() {
    if (!this.isBrowser || !this.keycloakReady()) {
      console.warn('Keycloak not ready or not in browser');
      return;
    }

    try {
      await this.keycloakService.login({
        redirectUri: window.location.origin,
        // Add additional options for cross-site compatibility
        scope: 'openid profile email'
      });
    } catch (error) {
      console.error('Login error:', error);
      // Fallback: redirect to Keycloak login page directly
      if (this.isBrowser) {
        window.location.href = 'https://keycloak.minutemail.co/realms/minutemail/protocol/openid-connect/auth?client_id=minutemail-web&redirect_uri=' + encodeURIComponent(window.location.origin) + '&response_type=code&scope=openid';
      }
    }
    this.closeMenu();
  }

  async register() {
    if (!this.isBrowser || !this.keycloakReady()) {
      console.warn('Keycloak not ready or not in browser');
      return;
    }

    try {
      await this.keycloakService.register({
        redirectUri: window.location.origin,
        scope: 'openid profile email'
      });
    } catch (error) {
      console.error('Register error:', error);
      // Fallback: redirect to Keycloak registration page directly
      if (this.isBrowser) {
        window.location.href = 'https://keycloak.minutemail.co/realms/minutemail/protocol/openid-connect/registrations?client_id=minutemail-web&redirect_uri=' + encodeURIComponent(window.location.origin) + '&response_type=code&scope=openid';
      }
    }
    this.closeMenu();
  }

  async logout() {
    if (!this.isBrowser || !this.keycloakReady()) {
      console.warn('Keycloak not ready or not in browser');
      return;
    }

    try {
      await this.keycloak.logout(window.location.origin);
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear local state and redirect
      if (this.isBrowser) {
        this.isAuthenticated.set(false);
        window.location.href = window.location.origin;
      }
    }
    this.closeMenu();
  }

  manageDomain() {
    this.router.navigate(['/manage-domain']);
    this.closeMenu();
  }

  manageApiKeys() {
    this.router.navigate(['/api-keys']);
    this.closeMenu();
  }

  mxConfiguration() {
    this.router.navigate(['/mx-configuration']);
    this.closeMenu();
  }

  // Close menu when clicking outside
  onDocumentClick(event: Event) {
    if (!this.isBrowser) return;

    const target = event.target as HTMLElement;
    const menuElement = target.closest('.profile-menu');

    if (!menuElement && this.isOpen()) {
      this.closeMenu();
    }
  }
}