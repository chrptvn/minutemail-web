import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  standalone: true
})
export class App implements OnInit {
  private isBrowser: boolean;

  constructor(
    private keycloakService: KeycloakService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) {
      console.log('App: Not in browser, skipping Keycloak setup');
      return;
    }

    console.log('App: Starting Keycloak setup...');
    
    // Check if we just completed authentication
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('code') && urlParams.has('state');
    
    if (hasAuthParams) {
      console.log('App: Authentication flow detected, waiting for completion...');
      
      // Wait longer for authentication to complete
      setTimeout(async () => {
        try {
          const isLoggedIn = await this.keycloakService.isLoggedIn();
          console.log('App: Post-auth login status:', isLoggedIn);
          
          if (isLoggedIn) {
            console.log('App: Authentication successful!');
            const token = this.keycloakService.getToken();
            console.log('App: Token available:', !!token);
            
            // Try to load user profile
            try {
              const userProfile = await this.keycloakService.loadUserProfile();
              console.log('App: User profile:', userProfile);
            } catch (error) {
              console.warn('App: Could not load user profile:', error);
            }
          }
        } catch (error) {
          console.error('App: Error checking post-auth status:', error);
        }
      }, 3000); // Wait 3 seconds for auth to complete
    }

    // Make Keycloak service available globally for debugging
    try {
      (window as any).keycloakService = this.keycloakService;
      (window as any).checkAuth = async () => {
        try {
          const isLoggedIn = await this.keycloakService.isLoggedIn();
          const token = this.keycloakService.getToken();
          console.log('Manual auth check - Logged in:', isLoggedIn, 'Token:', !!token);
          return { isLoggedIn, hasToken: !!token };
        } catch (error) {
          console.error('Manual auth check failed:', error);
          return { error };
        }
      };
      console.log('App: Keycloak service and checkAuth() function available globally for debugging');
    } catch (error) {
      console.warn('App: Error setting up global Keycloak access:', error);
    }
  }
}