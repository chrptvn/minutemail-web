import {Component, Inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomainService } from '../../core/services/domain.service';
import { ThemeService } from '../../core/services/theme.service';
import { Domain, AddDomainRequest } from '../../core/models/domain.model';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';

interface DomainWithStatus extends Domain {
  id: string;
  createdAt: Date;
  isConfigured: boolean;
  isClaimed: boolean;
  mxTestResult?: {
    status: 'success' | 'error';
    message: string;
    testedAt: Date;
  };
}

@Component({
  selector: 'app-manage-domain',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TablerIconComponent,
    ToastComponent,
    TopMenu,
    FooterComponent
  ],
  templateUrl: './manage-domain.component.html',
  styleUrl: './manage-domain.component.scss'
})
export class ManageDomainComponent implements OnInit {
  newDomain = '';
  domains: DomainWithStatus[] = [];
  loading = signal(false);
  addingDomain = false;
  testingMX = signal<string | null>(null);
  claimingDomain = signal<string | null>(null);
  removingDomain = signal<string | null>(null);

  // Toast notifications
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private domainService: DomainService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDomains();
    }
  }

  private loadDomains() {
    this.loading.set(true);

    this.domainService.getDomains().subscribe({
      next: (response) => {
        // Convert API response to local format with additional UI properties
        this.domains = (response.domains || []).map(domain => ({
          ...domain,
          id: this.generateId(),
          createdAt: new Date(), // You might want to get this from the API if available
          isConfigured: Math.random() > 0.5, // Placeholder - replace with actual verification
          isClaimed: true // Since these come from the user's list, they're claimed
        }));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading domains:', error);
        this.showToastMessage('error', error.message);
        this.loading.set(false);
      }
    });
  }

  addDomain() {
    if (!this.newDomain.trim()) {
      this.showToastMessage('error', 'Please enter a valid domain name');
      return;
    }

    // Check if domain already exists
    if (this.domains.some(d => d.domain.toLowerCase() === this.newDomain.toLowerCase())) {
      this.showToastMessage('error', 'This domain has already been added');
      return;
    }

    this.addingDomain = true;

    const request: AddDomainRequest = {
      domain: this.newDomain.trim()
    };

    this.domainService.addDomain(request).subscribe({
      next: (domain) => {
        const newDomainObj: DomainWithStatus = {
          ...domain,
          id: this.generateId(),
          createdAt: new Date(),
          isConfigured: false, // New domains start as unconfigured
          isClaimed: true
        };

        this.domains.push(newDomainObj);
        this.newDomain = '';
        this.addingDomain = false;

        this.showToastMessage('success', `Domain "${domain.domain}" added successfully`);
      },
      error: (error) => {
        console.error('Error adding domain:', error);
        this.showToastMessage('error', error.message);
        this.addingDomain = false;
      }
    });
  }

  testMXRecord(domain: DomainWithStatus) {
    this.testingMX.set(domain.id);

    this.domainService.verifyDomain(domain.domain).subscribe({
      next: (response) => {
        domain.mxTestResult = {
          status: response.valid ? 'success' : 'error',
          message: response.valid
            ? 'MX record is correctly configured and pointing to MinuteMail servers'
            : 'MX record not found or not pointing to MinuteMail servers. Please check your DNS configuration.',
          testedAt: new Date()
        };

        domain.isConfigured = response.valid;
        this.testingMX.set(null);

        this.showToastMessage(
          response.valid ? 'success' : 'error',
          `MX test ${response.valid ? 'passed' : 'failed'} for ${domain.domain}`
        );
      },
      error: (error) => {
        console.error('Error testing MX record:', error);
        domain.mxTestResult = {
          status: 'error',
          message: 'Failed to test MX record. Please try again later.',
          testedAt: new Date()
        };
        this.testingMX.set(null);
        this.showToastMessage('error', `Failed to test MX record for ${domain.domain}`);
      }
    });
  }

  claimDomain(domain: DomainWithStatus) {
    if (!domain.isConfigured || this.claimingDomain()) {
      return;
    }

    this.claimingDomain.set(domain.id);

    const request: AddDomainRequest = {
      domain: domain.domain
    };

    this.domainService.addDomain(request).subscribe({
      next: () => {
        domain.isClaimed = true;
        this.claimingDomain.set(null);
        this.showToastMessage('success', `Domain "${domain.domain}" claimed successfully`);
      },
      error: (error) => {
        console.error('Error claiming domain:', error);
        this.claimingDomain.set(null);
        this.showToastMessage('error', `Failed to claim domain "${domain.domain}": ${error.message}`);
      }
    });
  }

  removeDomain(domain: DomainWithStatus) {
    if (!confirm(`Are you sure you want to remove the domain "${domain.domain}"? This action cannot be undone.`)) {
      return;
    }

    this.removingDomain.set(domain.id);

    this.domainService.deleteDomain(domain.domain).subscribe({
      next: () => {
        this.domains = this.domains.filter(d => d.id !== domain.id);
        this.removingDomain.set(null);
        this.showToastMessage('success', `Domain "${domain.domain}" removed successfully`);
      },
      error: (error) => {
        console.error('Error removing domain:', error);
        this.removingDomain.set(null);
        this.showToastMessage('error', `Failed to remove domain "${domain.domain}": ${error.message}`);
      }
    });
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  getMXResultClasses(status: 'success' | 'error'): string {
    const baseClasses = 'p-3 rounded-lg border';
    if (status === 'success') {
      return `${baseClasses} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200`;
    } else {
      return `${baseClasses} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200`;
    }
  }

  getMXResultIconClasses(status: 'success' | 'error'): string {
    return status === 'success'
      ? 'text-green-500 dark:text-green-400'
      : 'text-red-500 dark:text-red-400';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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

  goToApi() {
    this.router.navigate(['/api']);
  }

  goToPrivacy() {
    this.router.navigate(['/privacy']);
  }

  goToMxConfiguration() {
    this.router.navigate(['/mx-configuration']);
  }
}
