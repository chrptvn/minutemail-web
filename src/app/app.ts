import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  standalone: true
})
export class App {
  constructor(private keycloakService: KeycloakService) {
    // Make Keycloak service available globally for token access
    if (typeof window !== 'undefined') {
      (window as any).keycloakService = this.keycloakService;
    }
  }
}
