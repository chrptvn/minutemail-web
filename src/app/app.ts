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
      // Make Keycloak service available globally for token access
      (window as any).keycloakService = this.keycloakService;
      console.log('Keycloak service made available globally');
    } catch (error) {
      console.warn('Error setting up Keycloak service globally:', error);
    }
  }
}