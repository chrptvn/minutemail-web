import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [
    CommonModule,
    TablerIconComponent,
    ButtonComponent,
    ToastComponent,
    TopMenu,
    FooterComponent
  ],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {
  private readonly router = inject(Router);
  private readonly keycloak = inject(Keycloak);

  expandedFaqItems = new Set<number>();

  // Toast notifications
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  faqItems = [
    {
      question: "Can I change my plan at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
    },
    {
      question: "What happens if I exceed my API call limit?",
      answer: "If you exceed your monthly API call limit, your API access will be temporarily suspended until the next billing cycle. You can upgrade your plan at any time to increase your limits."
    },
    {
      question: "Do you offer annual billing discounts?",
      answer: "Yes! Annual billing is available with a 20% discount on all paid plans. Contact us for more information about annual subscriptions."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe."
    },
    {
      question: "Is there a free trial for paid plans?",
      answer: "All paid plans come with a 14-day free trial. No credit card required to start your trial. You can cancel anytime during the trial period."
    },
    {
      question: "What happens to my custom domains if I downgrade?",
      answer: "If you downgrade to a plan with fewer domain slots, you'll need to remove excess domains before the change takes effect. We'll notify you in advance and help with the transition."
    }
  ];

  isAuthenticated(): boolean {
    return !!this.keycloak.authenticated;
  }

  subscribe(plan: string) {
    if (plan === 'free') {
      if (!this.isAuthenticated()) {
        // Redirect to login for free plan
        this.keycloak.login();
      }
      return;
    }

    // For paid plans, show a placeholder message for now
    this.showToastMessage('info', `Subscription for ${plan} plan will be implemented soon. Please check back later!`);
    
    // TODO: Implement actual subscription logic
    // This is where you would integrate with your payment processor
    console.log(`Subscribing to ${plan} plan`);
  }

  toggleFaqItem(index: number) {
    if (this.expandedFaqItems.has(index)) {
      this.expandedFaqItems.delete(index);
    } else {
      this.expandedFaqItems.add(index);
    }
  }

  isFaqExpanded(index: number): boolean {
    return this.expandedFaqItems.has(index);
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