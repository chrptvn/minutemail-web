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
      return; // Skip Keycloak setup on server
    }

    try {
      // Wait for Keycloak initialization to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Make Keycloak service available globally for token access
      (window as any).keycloakService = this.keycloakService;
      console.log('Keycloak service made available globally');
      
      // Check if we just completed authentication
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('code') && urlParams.has('state')) {
        console.log('Authentication flow completed, checking login status...');
        // Give Keycloak time to process the authentication
        setTimeout(async () => {
          try {
            const isLoggedIn = await this.keycloakService.isLoggedIn();
            console.log('Post-auth login status:', isLoggedIn);
          } catch (error) {
            console.warn('Error checking post-auth status:', error);
          }
        }, 2000);
      }
    } catch (error) {
      console.warn('Error setting up Keycloak service globally:', error);
    }
  }
}