import {Component, Inject, OnInit, OnDestroy, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomainService } from '../../core/services/domain.service';
import { Domain, AddDomainRequest } from '../../core/models/domain.model';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import {AuthService} from '../../core/services/auth.service';

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
export class ManageDomainComponent implements OnInit, OnDestroy {
  newDomain = '';
  domains: Domain[] = [];
  loading = signal(false);
  addingDomain = false;
  removingDomain = signal<string | null>(null);

  private pollInterval?: any;

  // Toast notifications
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private readonly router: Router,
    private readonly domainService: DomainService,
    private readonly authService: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.initKeycloak().then(authenticated => {
        if (authenticated) {
          this.loadDomains();
          this.startPolling();
        } else {
          this.authService.login();
        }
      }).catch(error => {
        console.error('API Keys - Keycloak initialization failed:', error);
      });
    }
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private loadDomains() {
    this.loading.set(true);

    this.domainService.getDomains().subscribe({
      next: (domains) => {
        this.domains = domains || [];
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading domains:', error);
        this.showToastMessage('error', error.message);
        this.loading.set(false);
      }
    });
  }

  private startPolling() {
    this.pollInterval = setInterval(() => {
      this.domainService.getDomains().subscribe({
        next: (domains) => this.domains = domains || [],
        error: (error) => console.error('Polling error:', error)
      });
    }, 30000); // Poll every 30 seconds
  }

  addDomain() {
    if (!this.newDomain.trim()) {
      this.showToastMessage('error', 'Please enter a valid domain name');
      return;
    }

    // Check if domain already exists
    if (this.domains.some(d => d.name.toLowerCase() === this.newDomain.toLowerCase())) {
      this.showToastMessage('error', 'This domain has already been added');
      return;
    }

    this.addingDomain = true;

    const request: AddDomainRequest = {
      name: this.newDomain.trim(),
      mailbox_ttl: 3600
    };

    this.domainService.addDomain(request).subscribe({
      next: (domain) => {
        this.domains.push(domain);
        this.newDomain = '';
        this.addingDomain = false;
        this.showToastMessage('success', `Domain "${domain.name}" added successfully`);
      },
      error: (error) => {
        console.error('Error adding domain:', error);
        this.showToastMessage('error', error.message);
        this.addingDomain = false;
      }
    });
  }

  removeDomain(domain: Domain) {
    if (!confirm(`Are you sure you want to remove the domain "${domain.name}"? This action cannot be undone.`)) {
      return;
    }

    this.removingDomain.set(domain.name);

    this.domainService.deleteDomain(domain.name).subscribe({
      next: () => {
        this.domains = this.domains.filter(d => d.name !== domain.name);
        this.removingDomain.set(null);
        this.showToastMessage('success', `Domain "${domain.name}" removed successfully`);
      },
      error: (error) => {
        console.error('Error removing domain:', error);
        this.removingDomain.set(null);
        this.showToastMessage('error', `Failed to remove domain "${domain.name}": ${error.message}`);
      }
    });
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
