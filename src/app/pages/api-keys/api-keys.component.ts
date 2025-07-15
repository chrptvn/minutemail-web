import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiKeyService } from '../../core/services/api-key.service';
import { ClipboardService } from '../../core/services/clipboard.service';
import { ThemeService } from '../../core/services/theme.service';
import { ApiKey, CreateApiKeyRequest } from '../../core/models/api-key.model';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TablerIconComponent,
    ToastComponent,
    SpinnerComponent,
    TopMenu,
    FooterComponent
  ],
  templateUrl: './api-keys.component.html',
  styleUrl: './api-keys.component.scss'
})
export class ApiKeysComponent implements OnInit {
  apiKeys = signal<ApiKey[]>([]);
  loading = signal(false);
  creating = signal(false);
  deleting = signal<{ [key: string]: boolean }>({});
  copying = signal<{ [key: string]: boolean }>({});
  copied = signal<{ [key: string]: boolean }>({});
  showApiKey = signal<{ [key: string]: boolean }>({});

  newApiKey: CreateApiKeyRequest = {
    name: '',
    ttl: 0,
    hosts: ['minutemail.co']
  };

  expiryDate = '';
  minDate = '';

  // Toast notifications
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private router: Router,
    private apiKeyService: ApiKeyService,
    private clipboardService: ClipboardService,
    public themeService: ThemeService
  ) {
    // Set minimum date to current time
    const now = new Date();
    this.minDate = now.toISOString().slice(0, 16);

    // Set default expiry to 30 days from now
    const defaultExpiry = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    this.expiryDate = defaultExpiry.toISOString().slice(0, 16);
  }

  ngOnInit() {
    this.loadApiKeys();
  }

  loadApiKeys() {
    this.loading.set(true);
    this.apiKeyService.getApiKeys().subscribe({
      next: (response) => {
        this.apiKeys.set(response.apiKeys || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading API keys:', error);
        this.showToastMessage('error', error.message);
        this.loading.set(false);
      }
    });
  }

  createApiKey() {
    if (!this.newApiKey.name.trim() || !this.expiryDate) {
      this.showToastMessage('error', 'Please fill in all required fields');
      return;
    }

    // Calculate TTL in seconds
    const expiryTime = new Date(this.expiryDate).getTime();
    const currentTime = Date.now();
    const ttlSeconds = Math.floor((expiryTime - currentTime) / 1000);

    if (ttlSeconds <= 0) {
      this.showToastMessage('error', 'Expiry date must be in the future');
      return;
    }

    // Filter out empty hosts
    const hosts = this.newApiKey.hosts.filter(host => host.trim() !== '');
    if (hosts.length === 0) {
      this.showToastMessage('error', 'At least one host is required');
      return;
    }

    this.creating.set(true);

    const request: CreateApiKeyRequest = {
      name: this.newApiKey.name.trim(),
      ttl: ttlSeconds,
      hosts: hosts
    };

    this.apiKeyService.createApiKey(request).subscribe({
      next: (apiKey) => {
        this.apiKeys.update(keys => [apiKey, ...keys]);
        this.resetForm();
        this.creating.set(false);
        this.showToastMessage('success', `API key "${apiKey.name}" created successfully`);
      },
      error: (error) => {
        console.error('Error creating API key:', error);
        this.showToastMessage('error', error.message);
        this.creating.set(false);
      }
    });
  }

  deleteApiKey(apiKey: ApiKey) {
    if (!confirm(`Are you sure you want to delete the API key "${apiKey.name}"? This action cannot be undone.`)) {
      return;
    }

    this.deleting.update(state => ({ ...state, [apiKey.api_key]: true }));

    this.apiKeyService.deleteApiKey(apiKey.api_key).subscribe({
      next: () => {
        this.apiKeys.update(keys => keys.filter(key => key.api_key !== apiKey.api_key));
        this.deleting.update(state => {
          const newState = { ...state };
          delete newState[apiKey.api_key];
          return newState;
        });
        this.showApiKey.update(state => {
          const newState = { ...state };
          delete newState[apiKey.api_key];
          return newState;
        });
        this.copying.update(state => {
          const newState = { ...state };
          delete newState[apiKey.api_key];
          return newState;
        });
        this.copied.update(state => {
          const newState = { ...state };
          delete newState[apiKey.api_key];
          return newState;
        });
        this.showToastMessage('success', `API key "${apiKey.name}" deleted successfully`);
      },
      error: (error) => {
        console.error('Error deleting API key:', error);
        this.showToastMessage('error', error.message);
        this.deleting.update(state => {
          const newState = { ...state };
          delete newState[apiKey.api_key];
          return newState;
        });
      }
    });
  }

  async copyApiKey(apiKey: string) {
    const keyId = this.getApiKeyId(apiKey);
    this.copying.update(state => ({ ...state, [keyId]: true }));

    try {
      const success = await this.clipboardService.copyToClipboard(apiKey);

      if (success) {
        this.copied.update(state => ({ ...state, [keyId]: true }));
        this.showToastMessage('success', 'API key copied to clipboard!');

        // Reset copied state after 2 seconds
        setTimeout(() => {
          this.copied.update(state => ({ ...state, [keyId]: false }));
        }, 2000);
      } else {
        this.showToastMessage('error', 'Failed to copy to clipboard');
      }
    } finally {
      this.copying.update(state => ({ ...state, [keyId]: false }));
    }
  }

  toggleApiKeyVisibility(keyId: string) {
    this.showApiKey.update(state => ({ ...state, [keyId]: !state[keyId] }));
  }

  maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
      return '*'.repeat(apiKey.length);
    }
    return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  }

  getApiKeyId(apiKey: string): string {
    // Use the API key itself as the ID for tracking states  
    return apiKey;
  }

  isApiKeyActive(apiKey: ApiKey): boolean {
    return new Date(apiKey.expire_at) > new Date();
  }

  addHost() {
    this.newApiKey.hosts.push('');
  }

  removeHost(index: number) {
    if (this.newApiKey.hosts.length > 1) {
      this.newApiKey.hosts.splice(index, 1);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (Math.abs(diffInHours) < 1) {
      const diffInMinutes = Math.floor(Math.abs(diffInHours) * 60);
      if (diffInHours > 0) {
        return diffInMinutes <= 0 ? 'in a moment' : `in ${diffInMinutes}m`;
      } else {
        return diffInMinutes <= 0 ? 'just now' : `${diffInMinutes}m ago`;
      }
    } else if (Math.abs(diffInHours) < 24) {
      if (diffInHours > 0) {
        return `in ${Math.floor(diffInHours)}h`;
      } else {
        return `${Math.floor(Math.abs(diffInHours))}h ago`;
      }
    } else if (Math.abs(diffInHours) < 48) {
      return diffInHours > 0 ? 'tomorrow' : 'yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  private resetForm() {
    this.newApiKey = {
      name: '',
      ttl: 0,
      hosts: ['minutemail.co']
    };

    // Reset expiry date to 30 days from now
    const defaultExpiry = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
    this.expiryDate = defaultExpiry.toISOString().slice(0, 16);
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

  goHome() {
    this.router.navigate(['/']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
