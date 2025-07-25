import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  
  private router = inject(Router);
  private keycloakService = inject(KeycloakService);

  constructor() {}

  async ngOnInit() {
    try {
      // Wait for Keycloak to be ready
      await this.keycloakService.isLoggedIn();
      this.keycloakReady.set(true);
    } catch (error) {
      console.warn('Keycloak initialization error:', error);
      this.keycloakReady.set(false);
    }
  }

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  isAuthenticated() {
    try {
      return this.keycloakReady() && this.keycloakService.isLoggedIn();
    } catch (error) {
      console.warn('Error checking authentication status:', error);
      return false;
    }
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  async login() {
    try {
      if (!this.keycloakReady()) {
        console.warn('Keycloak not ready yet');
        return;
      }
      await this.keycloakService.login({
        redirectUri: window.location.origin
      });
    } catch (error) {
      console.error('Login error:', error);
    }
    this.closeMenu();
  }

  async register() {
    try {
      if (!this.keycloakReady()) {
        console.warn('Keycloak not ready yet');
        return;
      }
      await this.keycloakService.register({
        redirectUri: window.location.origin
      });
    } catch (error) {
      console.error('Register error:', error);
    }
    this.closeMenu();
  }

  async logout() {
    try {
      if (!this.keycloakReady()) {
        console.warn('Keycloak not ready yet');
        return;
      }
      await this.keycloakService.logout(window.location.origin);
    } catch (error) {
      console.error('Logout error:', error);
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
    const target = event.target as HTMLElement;
    const menuElement = target.closest('.profile-menu');

    if (!menuElement && this.isOpen()) {
      this.closeMenu();
    }
  }
}
