import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AliasService } from '../../core/services/alias.service';
import { ClipboardService } from '../../core/services/clipboard.service';
import { ThemeService } from '../../core/services/theme.service';
import { AddressCardComponent } from '../../shared/components/address-card/address-card.component';
import { VpnBannerComponent } from '../../shared/components/vpn-banner/vpn-banner.component';
import { FaqComponent } from '../../shared/components/faq/faq.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import {ApiService} from '../../core/services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    AddressCardComponent,
    VpnBannerComponent,
    FaqComponent,
    ButtonComponent,
    TablerIconComponent,
    ToastComponent,
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
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private router: Router,
    private aliasService: AliasService,
    private apiService: ApiService,
    private clipboardService: ClipboardService,
    public themeService: ThemeService,
  ) {}

  ngOnInit() {
    const existingAlias = this.aliasService.getCurrentAlias();

    if (existingAlias) {
      this.apiService.getMails(existingAlias).subscribe({
        next: (result) => {
          const isExpired = result.expireAt && new Date(result.expireAt) < new Date();
          if (!isExpired) {
            this.expiresAt.set(result.expireAt ? new Date(result.expireAt).toISOString() : undefined);
            this.currentAlias.set(existingAlias + '@minutemail.co');
          }
        }
      })
    }
  }

  async generateAlias() {
    this.generating.set(true);

    try {
      // Call the new method that registers the alias with the API
      this.aliasService.generateAndRegisterAlias().subscribe({
        next: (result) => {
          this.currentAlias.set(result.alias);
          console.log('Generated alias:', result.alias);
          // Set expiration time if provided by API
          if (result.ttl) {
            const expirationTime = new Date(Date.now() + result.ttl * 1000);
            this.expiresAt.set(expirationTime.toISOString());
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
    } catch (error) {
      console.error('Unexpected error:', error);
      this.showToastMessage('error', 'An unexpected error occurred');
      this.generating.set(false);
    }
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
    const aliasName = this.aliasService.extractAliasFromEmail(this.currentAlias()!);
    this.router.navigate([`/mailbox/${aliasName}`]);
  }

  goToApi() {
    this.router.navigate(['/api']);
  }

  goToPrivacy() {
    this.router.navigate(['/privacy']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
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
