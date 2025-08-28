import {Component, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner.component';
import {TopMenu} from "../../shared/components/top-menu/top-menu";
import {FooterComponent} from '../../shared/components/footer/footer.component';
import {ActivatedRoute, Router} from '@angular/router';
import {SubscriptionService} from '../../core/services/subscription.service';
import {map} from 'rxjs/operators';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, SpinnerComponent, TopMenu, FooterComponent],
  templateUrl: './subscribe.component.html',
  styleUrl: './subscribe.component.scss'
})
export class SubscribeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly keycloak = inject(Keycloak);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      let plan = params.get('plan');
      let interval = params.get('interval');
      if (plan && interval) {
        this.subscriptionService.subscribe({ plan, interval }).subscribe({
          next: (response) => {
            if (response?.checkout_url) {
              window.location.href = response.checkout_url;
            } else {
              this.router.navigate(["/subscribe?status=error"])
            }
          },
          error: (error) => {
            this.router.navigate(["/subscribe?status=error"])
          }
        })
      }
    });
  }

  isSuccess(): boolean {
    return this.route.snapshot.queryParamMap.get('status') === 'success';
  }

  plan_name(): string {
    if (this.keycloak.authenticated) {
      if (this.keycloak.hasRealmRole("free")) {
        return "free";
      }
      if (this.keycloak.hasRealmRole("hobbyist")) {
        return "hobbyist";
      }
      if (this.keycloak.hasRealmRole("pro")) {
        return "pro";
      }
      if (this.keycloak.hasRealmRole("team")) {
        return "team";
      }
    }

    return ""
  }

  getPlanFeatures(): string[] {
    const planName = this.plan_name().toLowerCase();

    switch (planName) {
      case 'hobbyist':
        return [
          '1 custom domain',
          '5,000 API calls per month',
          'Unlimited temporary addresses',
          'Email attachments support',
          'Priority support'
        ];
      case 'pro':
        return [
          'Up to 5 custom domains',
          '50,000 API calls per month',
          'Unlimited temporary addresses',
          'Email attachments support',
          'Priority support',
          'Advanced analytics'
        ];
      case 'team':
        return [
          'Unlimited custom domains',
          '100,000 API calls per month',
          'Up to 5 seats',
          'Unlimited temporary addresses',
          'Email attachments support',
          'Priority support',
          'Team management',
          'Advanced analytics'
        ];
      default:
        return [
          'Premium features activated',
          'Enhanced API access',
          'Priority support'
        ];
    }
  }

  canManageDomains(): boolean {
    return this.keycloak.hasRealmRole('manage_domains');
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goToApi() {
    this.router.navigate(['/api']);
  }

  goToApiKeys() {
    this.router.navigate(['/api-keys']);
  }

  goToManageDomain() {
    this.router.navigate(['/manage-domain']);
  }


}
