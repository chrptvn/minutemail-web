import {Component, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import {TopMenu} from "../../shared/components/top-menu/top-menu";
import {FooterComponent} from '../../shared/components/footer/footer.component';
import {ActivatedRoute, Router} from '@angular/router';
import {SubscriptionService} from '../../core/services/subscription.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, TopMenu, FooterComponent],
  templateUrl: './subscribe.component.html',
  styleUrl: './subscribe.component.scss'
})
export class SubscribeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscriptionService = inject(SubscriptionService);

  plan_name = signal('');

  private membership = this.subscriptionService.getMembership();

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


}
