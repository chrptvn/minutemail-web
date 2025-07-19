import {Component, Inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiKeyService } from '../../core/services/api-key.service';
import { ClipboardService } from '../../core/services/clipboard.service';
import { ApiKey, CreateApiKeyRequest } from '../../core/models/api-key.model';
import { DomainService } from '../../core/services/domain.service';
import { Domain } from '../../core/models/domain.model';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import {AuthService} from '../../core/services/auth.service';

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
  domains = signal<Domain[]>([]);
  availableHosts = signal<string[]>(['minutemail.co']);
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

  selectedHostToAdd = '';
  expiryDate = '';
  minDate = '';

  // Toast notifications
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private readonly router: Router,
    private readonly apiKeyService: ApiKeyService,
    private readonly domainService: DomainService,
    private readonly clipboardService: ClipboardService,
    private readonly authService: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    // Set minimum date to current time
    const now = new Date();
    this.minDate = now.toISOString().slice(0, 10);

    // Leave expiry date empty by default (infinite)
    this.expiryDate = '';

    // Set default host to minutemail.co
    this.newApiKey.hosts = ['minutemail.co'];
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.initKeycloak().then(authenticated => {
        if (authenticated) {
          this.loadApiKeys();
          this.loadDomains();
        } else {
          this.authService.login();
        }
      }).catch(error => {
        console.error('API Keys - Keycloak initialization failed:', error);
      });
    }
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

  loadDomains() {
    this.domainService.getDomains().subscribe({
      next: (domains) => {
        this.domains.set(domains || []);
        // Update available hosts: minutemail.co + user domains
        const userDomains = domains.map(d => d.name);
        this.availableHosts.set(['minutemail.co', ...userDomains]);
      },
      error: (error) => {
        console.error('Error loading domains:', error);
        // Keep minutemail.co as fallback
        this.availableHosts.set(['minutemail.co']);
      }
    });
  }

  createApiKey() {
    if (!this.newApiKey.name.trim()) {
      this.showToastMessage('error', 'Please enter a name for the API key');
      return;
    }

    // Calculate TTL in seconds (0 for infinite if no date provided)
    let ttlSeconds = 0;
    if (this.expiryDate) {
      const expiryTime = new Date(this.expiryDate + 'T23:59:59').getTime();
      const currentTime = Date.now();
      ttlSeconds = Math.floor((expiryTime - currentTime) / 1000);

      if (ttlSeconds <= 0) {
        this.showToastMessage('error', 'Expiry date must be in the future');
        return;
      }
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

    this.deleting.update(state => ({ ...state, [apiKey.apiKey]: true }));

    this.apiKeyService.deleteApiKey(apiKey.apiKey.split("_")[2]).subscribe({
      next: () => {
        this.apiKeys.update(keys => keys.filter(key => key.apiKey !== apiKey.apiKey));
        this.deleting.update(state => {
          const newState = { ...state };
          delete newState[apiKey.apiKey];
          return newState;
        });
        this.showApiKey.update(state => {
          const newState = { ...state };
          delete newState[apiKey.apiKey];
          return newState;
        });
        this.copying.update(state => {
          const newState = { ...state };
          delete newState[apiKey.apiKey];
          return newState;
        });
        this.copied.update(state => {
          const newState = { ...state };
          delete newState[apiKey.apiKey];
          return newState;
        });
        this.showToastMessage('success', `API key "${apiKey.name}" deleted successfully`);
      },
      error: (error) => {
        console.error('Error deleting API key:', error);
        this.showToastMessage('error', error.message);
        this.deleting.update(state => {
          const newState = { ...state };
          delete newState[apiKey.apiKey];
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
    // If it's an infinite API key, it's always active
    if (this.isInfiniteApiKey(apiKey)) {
      return true;
    }
    // Otherwise check if expiry date is in the future
    return new Date(apiKey.expireAt) > new Date();
  }

  isInfiniteApiKey(apiKey: ApiKey): boolean {
    // Check for various infinite date formats
    return !apiKey.expireAt || 
           apiKey.expireAt === '0001-01-01T00:00:00Z' || 
           apiKey.expireAt === 'never' ||
           apiKey.expireAt === '';
  }

  getUnusedHosts(): string[] {
    return this.availableHosts().filter(host => !this.newApiKey.hosts.includes(host));
  }

  addSelectedHost() {
    if (this.selectedHostToAdd && !this.newApiKey.hosts.includes(this.selectedHostToAdd)) {
      this.newApiKey.hosts.push(this.selectedHostToAdd);
      this.selectedHostToAdd = ''; // Reset selection
    }
  }

  removeHost(index: number) {
    if (this.newApiKey.hosts.length > 1) {
      this.newApiKey.hosts.splice(index, 1);
    }
  }

  formatDate(dateString: string): string {
    // Handle infinite API keys
    if (!dateString || dateString === '0001-01-01T00:00:00Z' || dateString === 'never') {
      return 'Never expires';
    }

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
    this.selectedHostToAdd = '';

    // Leave expiry date empty by default (infinite)
    this.expiryDate = '';
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
}
