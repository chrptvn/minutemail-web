import { Component, OnInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss'
})
export class ProfileMenuComponent implements OnInit {
  isOpen = signal(false);
  isBrowser: boolean;

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (this.isBrowser) {
      try {
        // Only initialize if not already initialized
        if (!this.authService.keycloak) {
          const authenticated = await this.authService.initKeycloak();
          console.log('Profile menu - Keycloak init result:', authenticated);
        } else {
          console.log('Profile menu - Keycloak already initialized');
        }

        // Subscribe to auth state changes
        this.authService.isAuthenticated$.subscribe(authenticated => {
          console.log('Profile menu - Auth state changed:', authenticated);
          // Force change detection
          setTimeout(() => {
            console.log('Profile menu - Current auth state:', this.authService.isAuthenticated());
          }, 0);
        });
      } catch (error) {
        console.error('Profile menu - Keycloak init error:', error);
      }
    }
  }

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  login() {
    this.authService.login();
    this.closeMenu();
  }

  register() {
    this.authService.register();
    this.closeMenu();
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
  }

  manageDomain() {
    this.router.navigate(['/manage-domain']);
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
