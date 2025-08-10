import {Component, signal, inject, OnInit, ElementRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';
import { SubscriptionService } from '../../../core/services/subscription.service';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss'
})
export class ProfileMenuComponent implements OnInit{

  @ViewChild('menu', { static: true }) menu!: ElementRef<HTMLElement>;

  isOpen = signal(false);
  isAuthenticated = signal(false);
  currentPlan = signal<string>('free');
  showUpgradeSubmenu = signal(false);

  private readonly router = inject(Router);
  private readonly keycloak = inject(Keycloak);
  private readonly subscriptionService = inject(SubscriptionService);

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  closeMenu() {
    this.isOpen.set(false);
    this.showUpgradeSubmenu.set(false);
  }

  togglePlanSubmenu() {
    this.showUpgradeSubmenu.update(current => !current);
  }

  hidePlanSubmenu() {
    this.showUpgradeSubmenu.set(false);
  }
  onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement | null;
    if (next && this.menu.nativeElement.contains(next)) {
      return;
    }
    this.closeMenu();
  }

  async login() {
    this.keycloak.login().then(() => {
      this.isAuthenticated.set(!!this.keycloak.authenticated);
      this.closeMenu();
    }).then(() => {
      this.closeMenu();
    })
  }

  async register() {
    this.keycloak.register().then(() => {
      this.closeMenu();
    })
  }

  async logout() {
    this.keycloak.logout().then(() => {
      this.isAuthenticated.set(!!this.keycloak.authenticated);
      this.router.navigate(['/']);
    }).then(() => {
      this.closeMenu();
    })
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

  getCurrentPlanDisplayName(): string {
    const plan = this.currentPlan();
    switch (plan) {
      case 'free': return 'Free Plan';
      case 'hobbyist': return 'Hobbyist';
      case 'pro': return 'Pro';
      case 'team': return 'Team';
      default: return 'Free Plan';
    }
  }

  getAvailableUpgrades(): Array<{key: string, name: string, price: number}> {
    const current = this.currentPlan();
    const plans = [
      { key: 'hobbyist', name: 'Hobbyist', price: 5 },
      { key: 'pro', name: 'Pro', price: 15 },
      { key: 'team', name: 'Team', price: 50 }
    ];

    const planHierarchy = ['free', 'hobbyist', 'pro', 'team'];
    const currentIndex = planHierarchy.indexOf(current);
    
    return plans.filter((_, index) => index > currentIndex);
  }

  upgradeToPlan(planKey: string) {
    this.router.navigate(['/plan-change'], {
      queryParams: { plan: planKey, interval: 'monthly' }
    });
    this.closeMenu();
  }

  ngOnInit(): void {
    this.isAuthenticated.set(!!this.keycloak.authenticated);
    
    // Load current plan if authenticated
    if (this.keycloak.authenticated) {
      this.subscriptionService.getMembership().subscribe({
        next: (membership) => {
          this.currentPlan.set(membership.plan_name || 'free');
        },
        error: (error) => {
          console.error('Failed to fetch membership:', error);
          this.currentPlan.set('free');
        }
      });
    }
  }
}
