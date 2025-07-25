import { Component, signal, inject } from '@angular/core';
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
export class ProfileMenuComponent {
  isOpen = signal(false);
  
  private router = inject(Router);
  private keycloakService = inject(KeycloakService);

  constructor() {}

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  isAuthenticated() {
    return this.keycloakService.isLoggedIn();
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  login() {
    this.keycloakService.login();
    this.closeMenu();
  }

  register() {
    this.keycloakService.register();
    this.closeMenu();
  }

  logout() {
    this.keycloakService.logout();
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
