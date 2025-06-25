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
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
      <!-- Header -->
      <header class="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-3">
              <app-icon name="mail" [size]="24" class="text-primary-500"></app-icon>
              <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                MinuteMail.co
              </h1>
            </div>
            
            <app-button
              variant="ghost"
              size="sm"
              (onClick)="toggleTheme()"
              [ariaLabel]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              @if (themeService.isDarkMode()) {
                <app-icon name="sun" [size]="20"></app-icon>
              } @else {
                <app-icon name="moon" [size]="20"></app-icon>
              }
            </app-button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Temporary Email Address
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get a disposable email address that expires automatically. 
            Perfect for signups, downloads, and protecting your privacy.
          </p>
        </div>

        <div class="space-y-8">
          <!-- Address Card -->
          <div class="max-w-2xl mx-auto">
            <app-address-card
              [alias]="currentAlias()"
              [generating]="generating()"
              [copying]="copying()"
              [copied]="copied()"
              (onGenerate)="generateAlias()"
              (onCopy)="copyAlias()"
              (onViewInbox)="viewInbox()"
            ></app-address-card>
          </div>

          <!-- Features -->
          <div class="grid md:grid-cols-3 gap-6 mt-16">
            <div class="text-center p-6">
              <div class="w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <app-icon name="clock" [size]="24" class="text-primary-600 dark:text-primary-400"></app-icon>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Auto-Expires
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Your temporary email automatically expires after 60 minutes
              </p>
            </div>

            <div class="text-center p-6">
              <div class="w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <app-icon name="shield" [size]="24" class="text-primary-600 dark:text-primary-400"></app-icon>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Privacy First
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                No registration required. No tracking. Your privacy is protected.
              </p>
            </div>

            <div class="text-center p-6">
              <div class="w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <app-icon name="refresh" [size]="24" class="text-primary-600 dark:text-primary-400"></app-icon>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Real-time Updates
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Emails appear instantly in your temporary inbox
              </p>
            </div>
          </div>

          <!-- VPN Banner -->
          <div class="max-w-2xl mx-auto mt-16">
            <app-vpn-banner></app-vpn-banner>
          </div>
        </div>
      </main>

      <!-- Toast Notifications -->
      @if (showToast()) {
        <div class="fixed bottom-4 right-4 z-50">
          <app-toast
            [type]="toastType()"
            [message]="toastMessage()"
            (onClose)="hideToast()"
          ></app-toast>
        </div>
      }
    </div>
  `
})
export class HomeComponent implements OnInit {
  currentAlias = signal<string | null>(null);
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
        this.showToastMessage('success', 'Email address copied to clipboard!');
        
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
    const alias = this.currentAlias();
    if (alias) {
      const aliasName = this.aliasService.extractAliasFromEmail(alias);
      this.router.navigate([aliasName]);
    }
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