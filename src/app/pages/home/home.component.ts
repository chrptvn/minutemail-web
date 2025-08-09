import {Component, Inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import { Router } from '@angular/router';
import { AliasService } from '../../core/services/alias.service';
import { ClipboardService } from '../../core/services/clipboard.service';
import { DomainService } from '../../core/services/domain.service';
import { AddressCardComponent } from '../../shared/components/address-card/address-card.component';
import { VpnBannerComponent } from '../../shared/components/vpn-banner/vpn-banner.component';
import { FaqComponent } from '../../shared/components/faq/faq.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import {MailBoxService} from '../../core/services/mail-box.service';
import {TopMenu} from '../../shared/components/top-menu/top-menu';
import {FooterComponent} from '../../shared/components/footer/footer.component';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    AddressCardComponent,
    VpnBannerComponent,
    FaqComponent,
    ToastComponent,
    TopMenu,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentAlias = signal<string | undefined>(undefined);
  generating = signal(false);
  copying = signal(false);
  copied = signal(false);
  expiresAt = signal<string | undefined>(undefined);
  showDomainSelector = signal(false);
  availableDomains = signal<string[]>(['minutemail.co']);
  selectedDomain = signal('minutemail.co');
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private readonly router: Router,
    private readonly aliasService: AliasService,
    private readonly apiService: MailBoxService,
    private readonly domainService: DomainService,
    private readonly clipboardService: ClipboardService,
    private readonly keycloak: Keycloak,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  isAuthenticated(): boolean {
    return !!this.keycloak.authenticated;
  }

  ngOnInit() {
    // Check if user can manage domains and load their domains
    if (this.keycloak.authenticated && this.keycloak.hasRealmRole('manage_domains')) {
      this.showDomainSelector.set(true);
      this.loadUserDomains();
    }

    const existingAlias = this.aliasService.getCurrentAlias();
    if (existingAlias) {
      this.apiService.getMails(existingAlias).subscribe({
        next: (result) => {
          this.currentAlias.set(existingAlias);
          const isExpired = result.expireAt && new Date(result.expireAt) < new Date();
          if (!isExpired) {
            this.expiresAt.set(result.expireAt ? new Date(result.expireAt).toISOString() : undefined);
          }
        }
      })
    }
  }

  private loadUserDomains() {
    this.domainService.getDomains().subscribe({
      next: (domains) => {
        const userDomains = domains.map(d => d.name);
        this.availableDomains.set(['minutemail.co', ...userDomains]);
      },
      error: (error) => {
        console.error('Error loading domains:', error);
        // Keep minutemail.co as fallback
        this.availableDomains.set(['minutemail.co']);
      }
    });
  }

  generateAlias(domain?: string) {
      this.generating.set(true);

      const selectedDomain = domain || this.selectedDomain();

      // Call the new method that registers the alias with the API
      this.aliasService.generateAndRegisterAlias(selectedDomain)
        .subscribe({
          next: (result) => {
            this.currentAlias.set(result.alias);
            console.log('Generated alias:', result.alias);
            console.log('Expiration time:', result.expireAt);
            // Set expiration time if provided by API
            if (result.expireAt) {
              this.expiresAt.set(result.expireAt.toISOString());
            }

            this.showToastMessage('success', 'New email address generated and registered!');
            this.generating.set(false);
          },
          error: (error) => {
            console.error('Error generating alias:', error);
            this.showToastMessage('error', 'Failed to generate email address. Please try again.');
            this.generating.set(false);
          }
      });
  }

  async copyAlias() {
    const alias = this.currentAlias();
    if (!alias) return;

    this.copying.set(true);

    try {
      const success = await this.clipboardService.copyToClipboard(alias);

      if (success) {
        this.copied.set(true);
        this.showToastMessage('success', 'Email address copied to clipboard!');

        // Reset copied state after 2 seconds
        setTimeout(() => {
          this.copied.set(false);
        }, 2000);
      } else {
        this.showToastMessage('error', 'Failed to copy to clipboard');
      }
    } finally {
      this.copying.set(false);
    }
  }

  viewInbox() {
    this.router.navigate([`/mailbox`]);
  }

  onDomainChange(domain: string) {
    this.selectedDomain.set(domain);
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
