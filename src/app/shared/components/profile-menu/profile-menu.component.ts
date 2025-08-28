import {Component, signal, inject, OnInit, ElementRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { AuthService } from '../../../core/services/auth.service';
import { AliasService } from '../../../core/services/alias.service';
import { DomainPreferenceService } from '../../../core/services/domain-preference.service';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss'
})
export class ProfileMenuComponent implements OnInit {

  @ViewChild('menu', { static: true }) menu!: ElementRef<HTMLElement>;

  isOpen = signal(false);
  isAuthenticated = signal(false);

  private readonly router = inject(Router);
  private readonly keycloak = inject(Keycloak);
  private readonly authService = inject(AuthService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly aliasService = inject(AliasService);
  private readonly domainPreferenceService = inject(DomainPreferenceService);

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement | null;
    if (next && this.menu.nativeElement.contains(next)) {
      return;
    }
    this.closeMenu();
  }

  async login() {
    try {
      await this.authService.login();
      this.isAuthenticated.set(this.authService.isAuthenticated());
      // Clear current alias and domain preferences on login
      this.aliasService.clearCurrentAlias();
      this.domainPreferenceService.clearPreferredDomain();
      this.closeMenu();
    } catch (error) {
      console.error('Login failed:', error);
      this.closeMenu();
    }
  }

  async register() {
    try {
      await this.authService.register();
      this.isAuthenticated.set(this.authService.isAuthenticated());
      // Clear current alias and domain preferences on registration
      this.aliasService.clearCurrentAlias();
      this.domainPreferenceService.clearPreferredDomain();
      this.closeMenu();
    } catch (error) {
      console.error('Registration failed:', error);
      this.closeMenu();
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.isAuthenticated.set(false);
      // Clear current alias and domain preferences on logout
      this.aliasService.clearCurrentAlias();
      this.domainPreferenceService.clearPreferredDomain();
      this.router.navigate(['/']);
      this.closeMenu();
    } catch (error) {
      console.error('Logout failed:', error);
      this.closeMenu();
    }
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
    this.closeMenu();
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role)
  }

  manageDomain() {
    this.router.navigate(['/manage-domain']);
    this.closeMenu();
  }

  manageApiKeys() {
    this.router.navigate(['/api-keys']);
    this.closeMenu();
  }

  manageMembers() {
    this.router.navigate(['/members']);
    this.closeMenu();
  }

  manageBilling() {
    this.subscriptionService.getBillingPortal().subscribe({
      next: (response) => {
        if (response?.url) {
          window.open(response.url, '_blank');
        }
        this.closeMenu();
      },
      error: (error) => {
        console.error('Failed to open billing portal:', error);
        this.closeMenu();
      }
    });
  }

  getCurrentPlanDisplayName(): string {
    if (this.keycloak.hasRealmRole("hobbyist")) {
      return 'Hobbyist';
    }
    if (this.keycloak.hasRealmRole("pro")) {
      return 'Pro';
    }
    if (this.keycloak.hasRealmRole("team")) {
      return 'Team';
    }

    return 'Free Plan';
  }

  ngOnInit(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());
    
    // Subscribe to auth status changes
    this.authService.getAuthStatus().subscribe(authenticated => {
      this.isAuthenticated.set(authenticated);
    });
  }
}
