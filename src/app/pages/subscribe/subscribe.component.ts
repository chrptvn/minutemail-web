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

  plan_name = signal('');

  private readonly membership = this.subscriptionService.getMembership();

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      let plan = params.get('plan');
      let interval = params.get('interval');
      if (plan && interval) {
        this.subscriptionService.subscribe({ plan, interval }).subscribe({
          next: (response) => {
            if (!response?.url) {
              console.error('Invalid response from subscription service');
              this.router.navigate(['/subscribe?status=error']);
              return;
            }
            window.location.href = response.url;
          },
          error: (error) => {
            this.router.navigate(["/subscribe?status=error"])
          }
        })
      }

      this.membership.pipe(
        map(m => {
          switch (m?.plan_name) {
            case 'hobbyist': return 'Hobbyist';
            case 'pro': return 'Pro';
            case 'team': return 'Team';
            default: return '';
          }
        })
      ).subscribe(plan => {
        this.plan_name.set(plan ?? '')
      })
    });
  }

  isSuccess(): boolean {
    return this.route.snapshot.queryParamMap.get('status') === 'success';
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
