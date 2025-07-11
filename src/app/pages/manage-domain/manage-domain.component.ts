import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import {TopMenu} from '../../shared/components/top-menu/top-menu';
import {FooterComponent} from "../../shared/components/footer/footer.component";

interface Domain {
  id: string;
  name: string;
  createdAt: Date;
  isConfigured: boolean;
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
export class ManageDomainComponent {
  newDomain = '';
  domains: Domain[] = [];
  addingDomain = false;
  testingMX = signal<string | null>(null);
  removingDomain = signal<string | null>(null);

  // Toast notifications
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {}

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

    // Simulate API call
    setTimeout(() => {
      const newDomainObj: Domain = {
        id: this.generateId(),
        name: this.newDomain.trim(),
        createdAt: new Date(),
        isConfigured: Math.random() > 0.5 // Randomize for now
      };

      this.domains.push(newDomainObj);
      this.newDomain = '';
      this.addingDomain = false;

      this.showToastMessage('success', `Domain "${newDomainObj.name}" added successfully`);
    }, 1000);
  }

  testMXRecord(domain: Domain) {
    this.testingMX.set(domain.id);

    // Simulate MX record test
    setTimeout(() => {
      // Randomly simulate success or failure for demo
      const isSuccess = Math.random() > 0.3;

      domain.mxTestResult = {
        status: isSuccess ? 'success' : 'error',
        message: isSuccess
          ? 'MX record is correctly configured and pointing to MinuteMail servers'
          : 'MX record not found or not pointing to MinuteMail servers. Please check your DNS configuration.',
        testedAt: new Date()
      };

      this.testingMX.set(null);

      this.showToastMessage(
        isSuccess ? 'success' : 'error',
        `MX test ${isSuccess ? 'passed' : 'failed'} for ${domain.name}`
      );
    }, 2000);
  }

  removeDomain(domain: Domain) {
    this.removingDomain.set(domain.id);

    // Simulate API call
    setTimeout(() => {
      this.domains = this.domains.filter(d => d.id !== domain.id);
      this.removingDomain.set(null);

      this.showToastMessage('success', `Domain "${domain.name}" removed successfully`);
    }, 1000);
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

  helpConfigure(domain: Domain) {
    // Navigate to MX configuration documentation page
    this.router.navigate(['/mx-configuration'], {
      queryParams: { domain: domain.name }
    }).then(success => {
      if (!success) {
        console.error('Navigation to MX configuration failed');
        this.showToastMessage('error', 'Failed to navigate to configuration page');
      }
    }).catch(error => {
      console.error('Navigation error:', error);
      this.showToastMessage('error', 'Failed to navigate to configuration page');
    });
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

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
