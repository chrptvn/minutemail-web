import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService } from '../../core/services/subscription.service';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-plan-change',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TablerIconComponent,
    ToastComponent,
    TopMenu,
    FooterComponent
  ],
  templateUrl: './plan-change.component.html',
  styleUrl: './plan-change.component.scss'
})
export class PlanChangeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly keycloak = inject(Keycloak);

  targetPlan = signal<string>('');
  interval = signal<string>('monthly');
  accepted = false;
  updating = signal(false);

  // Toast notifications
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  ngOnInit() {
    // Get parameters from route
    this.route.queryParams.subscribe(params => {
      const target = params['plan'];
      const billingInterval = params['interval'] || 'monthly';

      if (!target) {
        this.router.navigate(['/pricing']);
        return;
      }

      this.targetPlan.set(target);
      this.interval.set(billingInterval);
    });
  }

  currentPlan(): string {
    if (this.keycloak.authenticated) {
      if (this.keycloak.hasRealmRole('team')) {
        return 'team';
      }
      if (this.keycloak.hasRealmRole('pro')) {
        return 'pro';
      }
      if (this.keycloak.hasRealmRole('hobbyist')) {
        return 'hobbyist';
      }
    }
    return 'free';
  }

  isUpgrade(): boolean {
    const planHierarchy = ['free', 'hobbyist', 'pro', 'team'];
    const currentIndex = planHierarchy.indexOf(this.currentPlan());
    const targetIndex = planHierarchy.indexOf(this.targetPlan());
    return targetIndex > currentIndex;
  }

  getCurrentPlanDisplayName(): string {
    const plan = this.currentPlan();
    switch (plan) {
      case 'free': return 'Free';
      case 'hobbyist': return 'Hobbyist';
      case 'pro': return 'Pro';
      case 'team': return 'Team';
      default: return 'Unknown';
    }
  }

  getTargetPlanDisplayName(): string {
    const plan = this.targetPlan();
    switch (plan) {
      case 'free': return 'Free';
      case 'hobbyist': return 'Hobbyist';
      case 'pro': return 'Pro';
      case 'team': return 'Team';
      default: return 'Unknown';
    }
  }

  getCurrentPlanFeatures(): string[] {
    const plan = this.currentPlan();
    return this.getPlanFeatures(plan);
  }

  getTargetPlanFeatures(): string[] {
    const plan = this.targetPlan();
    return this.getPlanFeatures(plan);
  }

  private getPlanFeatures(plan: string): string[] {
    switch (plan) {
      case 'free':
        return [
          'Up to 100 API calls per month',
          'Unlimited temporary addresses'
        ];
      case 'hobbyist':
        return [
          '1 custom domain',
          '5,000 API calls per month',
          'Unlimited temporary addresses'
        ];
      case 'pro':
        return [
          'Up to 5 custom domains',
          '50,000 API calls per month',
          'Unlimited temporary addresses'
        ];
      case 'team':
        return [
          'Unlimited custom domains',
          '100,000 API calls per month',
          'Up to 5 seats, $5 per extra seat',
          'Unlimited temporary addresses'
        ];
      default:
        return [];
    }
  }

  getConditionsTitle(): string {
    if (this.isUpgrade()) {
      return 'Upgrade Conditions';
    } else if (this.targetPlan() === 'free') {
      return 'Subscription Cancellation';
    } else {
      return 'Downgrade Conditions';
    }
  }

  getConditionsIcon(): string {
    if (this.isUpgrade()) {
      return 'info';
    } else if (this.targetPlan() === 'free') {
      return 'alert-triangle';
    } else {
      return 'alert-triangle';
    }
  }

  getConditionsIconClass(): string {
    if (this.isUpgrade()) {
      return 'text-blue-600 dark:text-blue-400';
    } else if (this.targetPlan() === 'free') {
      return 'text-red-600 dark:text-red-400';
    } else {
      return 'text-yellow-600 dark:text-yellow-400';
    }
  }

  getConditionsCardClass(): string {
    const baseClasses = 'p-6 rounded-lg border';

    if (this.isUpgrade()) {
      return `${baseClasses} conditions-upgrade`;
    } else if (this.targetPlan() === 'free') {
      return `${baseClasses} conditions-cancel`;
    } else {
      return `${baseClasses} conditions-downgrade`;
    }
  }

  getConfirmButtonText(): string {
    if (this.isUpgrade()) {
      return `Upgrade to ${this.getTargetPlanDisplayName()}`;
    } else if (this.targetPlan() === 'free') {
      return 'Cancel Subscription';
    } else {
      return `Downgrade to ${this.getTargetPlanDisplayName()}`;
    }
  }

  confirmPlanChange() {
    if (!this.accepted || this.updating()) {
      return;
    }

    this.updating.set(true);

    const subscription = {
      plan: this.targetPlan(),
      interval: this.interval()
    };

    this.subscriptionService.subscribe(subscription).subscribe({
      next: (response) => {
        // Plan change scheduled for end of billing cycle
        this.showToastMessage('success', this.getSuccessMessage());
        setTimeout(() => {
          this.router.navigate(['/subscribe'], { queryParams: { status: 'success' } });
        }, 2000);

        this.updating.set(false);
      },
      error: (error) => {
        console.error('Plan change failed:', error);
        this.showToastMessage('error', 'Failed to update plan. Please try again later.');
        this.updating.set(false);
      }
    });
  }

  private getSuccessMessage(): string {
    if (this.isUpgrade()) {
      return `Plan upgraded to ${this.getTargetPlanDisplayName()}! You now have access to all new features.`;
    } else if (this.targetPlan() === 'free') {
      return 'Subscription cancellation scheduled. You\'ll continue to have access until the end of your billing period.';
    } else {
      return `Plan change to ${this.getTargetPlanDisplayName()} scheduled for the end of your billing period.`;
    }
  }

  goBack() {
    this.router.navigate(['/pricing']);
  }

  private showToastMessage(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    this.toastType.set(type);
    this.toastMessage.set(message);
    this.showToast.set(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  hideToast() {
    this.showToast.set(false);
  }
}
