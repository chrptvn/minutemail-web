import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AliasService } from '../../core/services/alias.service';
import { ClipboardService } from '../../core/services/clipboard.service';
import { ThemeService } from '../../core/services/theme.service';
import { AddressCardComponent } from '../../shared/components/address-card/address-card.component';
import { VpnBannerComponent } from '../../shared/components/vpn-banner/vpn-banner.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    AddressCardComponent,
    VpnBannerComponent,
    ButtonComponent,
    TablerIconComponent,
    ToastComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentAlias = signal<string | undefined>(undefined);
  generating = signal(false);
  copying = signal(false);
  copied = signal(false);

  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private aliasService: AliasService,
    private clipboardService: ClipboardService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    const existingAlias = this.aliasService.getCurrentAlias();
    if (existingAlias) {
      this.currentAlias.set(existingAlias);
    }
  }

  async generateAlias() {
    this.generating.set(true);

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const newAlias = this.aliasService.generateRandomAlias();
      this.currentAlias.set(newAlias);

      this.showToastMessage('success', 'New email address generated!');
    } catch (error) {
      this.showToastMessage('error', 'Failed to generate email address');
    } finally {
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

        // Reset copied state after 2 seconds
        setTimeout(() => {
          this.copied.set(false);
        }, 2000);
      } else {
        this.showToastMessage('error', 'Failed to copy to clipboard');
      }
    } catch (error) {
      this.showToastMessage('error', 'Failed to copy to clipboard');
    } finally {
      this.copying.set(false);
    }
  }

  viewInbox() {
    const aliasName = this.aliasService.extractAliasFromEmail(this.currentAlias()!);
    window.location.href = `/${aliasName}`;
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
