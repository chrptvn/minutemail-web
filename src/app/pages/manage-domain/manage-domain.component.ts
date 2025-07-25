import {Component, OnInit, OnDestroy, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomainService } from '../../core/services/domain.service';
import { ClipboardService } from '../../core/services/clipboard.service';
import { Domain, AddDomainRequest } from '../../core/models/domain.model';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';

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
  domains = signal<Domain[]>([])
  loading = signal(false);
  addingDomain = false;
  removingDomain = signal<string | null>(null);
  copyingTxt = signal<{ [key: string]: boolean }>({});
  copiedTxt = signal<{ [key: string]: boolean }>({});

  private pollInterval?: any;

  // Toast notifications
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private readonly router: Router,
    private readonly domainService: DomainService,
    private readonly clipboardService: ClipboardService,
  ) {}

  ngOnInit() {
    this.loadDomains();
    this.startPolling();
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
        this.domains.set(domains || []);
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
        next: (domains) => this.domains.set(domains || []),
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
    if (this.domains().some(d => d.name.toLowerCase() === this.newDomain.toLowerCase())) {
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
        this.domains.update(domains => [...domains, domain]);
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
        this.domains.update(domains => domains.filter(d => d.name !== domain.name));
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

  async copyTxtRecord(txtRecord: string, domainName: string) {
    this.copyingTxt.update(state => ({ ...state, [domainName]: true }));

    try {
      const success = await this.clipboardService.copyToClipboard(txtRecord);

      if (success) {
        this.copiedTxt.update(state => ({ ...state, [domainName]: true }));
        this.showToastMessage('success', 'TXT record copied to clipboard!');

        // Reset copied state after 2 seconds
        setTimeout(() => {
          this.copiedTxt.update(state => ({ ...state, [domainName]: false }));
        }, 2000);
      } else {
        this.showToastMessage('error', 'Failed to copy to clipboard');
      }
    } finally {
      this.copyingTxt.update(state => ({ ...state, [domainName]: false }));
    }
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
