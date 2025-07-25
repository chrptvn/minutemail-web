import { Component, signal, inject, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
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
export class ProfileMenuComponent implements OnInit, OnDestroy {
  isOpen = signal(false);
  keycloakReady = signal(false);
  isAuthenticated = signal(false);
  
  private router = inject(Router);
  private keycloakService = inject(KeycloakService);
  private isBrowser: boolean;
  private authCheckInterval?: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) {
      console.log('Not in browser, skipping Keycloak initialization');
      return;
    }

    console.log('ProfileMenuComponent: Starting initialization...');
    
    // Wait for Keycloak to be fully initialized
    await this.waitForKeycloakReady();
    
    // Check initial authentication state
    await this.checkAuthenticationState();
    
    // Set up periodic authentication state checking
    this.setupAuthStateListener();
  }

  ngOnDestroy() {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
    }
  }

  private async waitForKeycloakReady(): Promise<void> {
    console.log('Waiting for Keycloak to be ready...');
    
    // Try multiple times with increasing delays
    for (let i = 0; i < 10; i++) {
      try {
        // Try to access Keycloak instance
        const isLoggedIn = await this.keycloakService.isLoggedIn();
        console.log(`Attempt ${i + 1}: Keycloak ready, logged in:`, isLoggedIn);
        this.keycloakReady.set(true);
        return;
      } catch (error) {
        console.log(`Attempt ${i + 1}: Keycloak not ready yet:`, error);
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1))); // Increasing delay
      }
    }
    
    console.error('Keycloak failed to initialize after multiple attempts');
    this.keycloakReady.set(false);
  }

  private async checkAuthenticationState(): Promise<void> {
    if (!this.keycloakReady()) {
      console.log('Keycloak not ready, skipping auth check');
      return;
    }

    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      console.log('Authentication state check result:', isLoggedIn);
      
      if (isLoggedIn) {
        const token = this.keycloakService.getToken();
        const userProfile = await this.keycloakService.loadUserProfile();
        console.log('User profile:', userProfile);
        console.log('Token available:', !!token);
      }
      
      this.isAuthenticated.set(isLoggedIn);
    } catch (error) {
      console.error('Error checking authentication state:', error);
      this.isAuthenticated.set(false);
    }
  }

  private setupAuthStateListener() {
    console.log('Setting up authentication state listener...');
    
    this.authCheckInterval = setInterval(async () => {
      if (this.keycloakReady()) {
        try {
          const isLoggedIn = await this.keycloakService.isLoggedIn();
          const currentState = this.isAuthenticated();
          
          if (currentState !== isLoggedIn) {
            console.log('Authentication state changed:', currentState, '->', isLoggedIn);
            this.isAuthenticated.set(isLoggedIn);
            
            if (isLoggedIn) {
              console.log('User just logged in, getting user info...');
              try {
                const userProfile = await this.keycloakService.loadUserProfile();
                console.log('User profile loaded:', userProfile);
              } catch (error) {
                console.error('Error loading user profile:', error);
              }
            }
          }
        } catch (error) {
          console.warn('Error in auth state check:', error);
        }
      }
    }, 1000);
  }

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  async login() {
    if (!this.isBrowser || !this.keycloakReady()) {
      console.warn('Cannot login: Keycloak not ready or not in browser');
      return;
    }

    console.log('Starting login process...');
    
    try {
      await this.keycloakService.login({
        redirectUri: window.location.origin,
        scope: 'openid profile email'
      });
    } catch (error) {
      console.error('Login error:', error);
      // Fallback: redirect to Keycloak login page directly
      const loginUrl = `https://keycloak.minutemail.co/realms/minutemail/protocol/openid-connect/auth?client_id=minutemail-web&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=openid`;
      console.log('Fallback: redirecting to:', loginUrl);
      window.location.href = loginUrl;
    }
    this.closeMenu();
  }

  async register() {
    if (!this.isBrowser || !this.keycloakReady()) {
      console.warn('Cannot register: Keycloak not ready or not in browser');
      return;
    }

    console.log('Starting registration process...');
    
    try {
      await this.keycloakService.register({
        redirectUri: window.location.origin,
        scope: 'openid profile email'
      });
    } catch (error) {
      console.error('Register error:', error);
      // Fallback: redirect to Keycloak registration page directly
      const registerUrl = `https://keycloak.minutemail.co/realms/minutemail/protocol/openid-connect/registrations?client_id=minutemail-web&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=openid`;
      console.log('Fallback: redirecting to:', registerUrl);
      window.location.href = registerUrl;
    }
    this.closeMenu();
  }

  async logout() {
    if (!this.isBrowser || !this.keycloakReady()) {
      console.warn('Cannot logout: Keycloak not ready or not in browser');
      return;
    }

    console.log('Starting logout process...');
    
    try {
      await this.keycloakService.logout(window.location.origin);
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear local state and redirect
      this.isAuthenticated.set(false);
      window.location.href = window.location.origin;
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