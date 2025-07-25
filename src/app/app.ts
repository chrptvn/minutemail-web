import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  standalone: true
})
export class App implements OnInit {
  constructor(private keycloakService: KeycloakService) {
  }

  async ngOnInit() {
    try {
      // Wait for Keycloak to initialize
      await this.keycloakService.isLoggedIn();
      
      // Make Keycloak service available globally for token access
      if (typeof window !== 'undefined') {
        (window as any).keycloakService = this.keycloakService;
      }
    } catch (error) {
      console.warn('Keycloak initialization failed:', error);
    }
  }
}
