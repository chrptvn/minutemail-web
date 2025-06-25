import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { timer, Subject, switchMap, takeUntil, catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AliasService } from '../../core/services/alias.service';
import { ThemeService } from '../../core/services/theme.service';
import { Mail } from '../../core/models/mail.model';
import { MailTableComponent } from '../../shared/components/mail-table/mail-table.component';
import { MailViewerComponent } from '../../shared/components/mail-viewer/mail-viewer.component';
import { CountdownComponent } from '../../shared/components/ui/countdown.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner.component';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [
    CommonModule,
    MailTableComponent,
    MailViewerComponent,
    CountdownComponent,
    ButtonComponent,
    TablerIconComponent,
    ToastComponent,
    SpinnerComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
      <!-- Header -->
      <header class="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-4">
              <app-button
                variant="ghost"
                size="sm"
                (onClick)="goHome()"
                ariaLabel="Go back to home"
              >
                <app-icon name="arrow-left" [size]="20"></app-icon>
              </app-button>
              
              <div class="flex items-center space-x-3">
                <app-icon name="mail" [size]="24" class="text-primary-500"></app-icon>
                <div>
                  <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {{ fullAlias() }}
                  </h1>
                  @if (expiresAt()) {
                    <app-countdown [expiresAt]="expiresAt()"></app-countdown>
                  }
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <app-button
                variant="ghost"
                size="sm"
                [loading]="refreshing()"
                (onClick)="refreshMails()"
                ariaLabel="Refresh inbox"
              >
                <app-icon name="refresh" [size]="20"></app-icon>
              </app-button>
              
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
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (error()) {
          <div class="max-w-2xl mx-auto">
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <app-icon name="alert-circle" [size]="48" class="mx-auto text-red-500 mb-4"></app-icon>
              <h2 class="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Inbox Error
              </h2>
              <p class="text-red-700 dark:text-red-300 mb-4">
                {{ error() }}
              </p>
              <div class="space-x-3">
                <app-button
                  variant="primary"
                  (onClick)="refreshMails()"
                  [loading]="loading()"
                >
                  Try Again
                </app-button>
                <app-button
                  variant="secondary"
                  (onClick)="goHome()"
                >
                  Go Home
                </app-button>
              </div>
            </div>
          </div>
        } @else {
          <div class="space-y-6">
            <!-- Inbox Stats -->
            <div class="bg-white dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Inbox
                  </h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ mails().length }} {{ mails().length === 1 ? 'message' : 'messages' }}
                    @if (loading()) {
                      <span class="ml-2">
                        <app-spinner size="sm"></app-spinner>
                      </span>
                    }
                  </p>
                </div>
                
                @if (mails().length > 0) {
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {{ formatDate(lastUpdated()) }}
                  </div>
                }
              </div>
            </div>

            <!-- Mail Table -->
            <app-mail-table
              [mails]="mails()"
              [loading]="loading() && mails().length === 0"
              (onMailClick)="openMail($event)"
              (onDeleteClick)="deleteMail($event.mail)"
            ></app-mail-table>
          </div>
        }
      </main>

      <!-- Mail Viewer -->
      <app-mail-viewer
        [mail]="selectedMail()"
        [isOpen]="isMailViewerOpen()"
        (onClose)="closeMail()"
        (onDelete)="deleteMail($event)"
      ></app-mail-viewer>

      <!-- Toast Notifications -->
      @if (showToast()) {
        <div class="fixed bottom-4 right-4 z-40">
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
export class InboxComponent implements OnInit, OnDestroy {
  alias = signal<string>('');
  fullAlias = signal<string>('');
  mails = signal<Mail[]>([]);
  selectedMail = signal<Mail | undefined>(undefined);
  isMailViewerOpen = signal(false);
  loading = signal(false);
  refreshing = signal(false);
  error = signal<string | null>(null);
  expiresAt = signal<string | undefined | null>(undefined);
  lastUpdated = signal<Date>(new Date());

  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  private destroy$ = new Subject<void>();
  private readonly POLL_INTERVAL = 5000; // 5 seconds

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private aliasService: AliasService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const alias = params['alias'];
      if (alias) {
        this.alias.set(alias);
        this.fullAlias.set(`${alias}@minutemail.co`);
        this.aliasService.setCurrentAlias(this.fullAlias());
        this.startPolling();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPolling() {
    this.loadMails(true);
    
    // Start polling every 5 seconds
    timer(this.POLL_INTERVAL, this.POLL_INTERVAL)
      .pipe(
        switchMap(() => this.apiService.getMails(this.alias())),
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Polling error:', error);
          return of({ mails: [], expiresAt: undefined });
        })
      )
      .subscribe(response => {
        const newMails = response.mails || [];
        const currentMails = this.mails();
        
        // Check for new mails
        const newMailIds = new Set(newMails.map(m => m.id));
        const currentMailIds = new Set(currentMails.map(m => m.id));
        
        const hasNewMails = newMails.some(mail => !currentMailIds.has(mail.id));
        
        if (hasNewMails) {
          this.showToastMessage('info', 'New email received!');
        }
        
        this.mails.set(newMails);
        this.lastUpdated.set(new Date());
        
        if (response.expiresAt) {
          this.expiresAt.set(response.expiresAt);
        }
      });
  }

  private loadMails(showLoading = false) {
    if (showLoading) {
      this.loading.set(true);
    }
    this.error.set(null);

    this.apiService.getMails(this.alias())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.mails.set(response.mails || []);
          this.lastUpdated.set(new Date());
          
          if (response.expiresAt) {
            this.expiresAt.set(response.expiresAt);
          }
          
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error.message);
          this.loading.set(false);
          this.showToastMessage('error', error.message);
        }
      });
  }

  refreshMails() {
    this.refreshing.set(true);
    
    this.apiService.getMails(this.alias())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.mails.set(response.mails || []);
          this.lastUpdated.set(new Date());
          this.refreshing.set(false);
          this.showToastMessage('success', 'Inbox refreshed');
        },
        error: (error) => {
          this.refreshing.set(false);
          this.showToastMessage('error', 'Failed to refresh inbox');
        }
      });
  }

  openMail(mail: Mail) {
    this.selectedMail.set(mail);
    this.isMailViewerOpen.set(true);
  }

  closeMail() {
    this.isMailViewerOpen.set(false);
    this.selectedMail.set(undefined);
  }

  deleteMail(mail: Mail) {
    // For now, just show a placeholder message since the delete API might not be ready
    this.showToastMessage('info', 'Delete functionality will be available soon');
    
    // Uncomment when delete API is ready:
    /*
    this.apiService.deleteMail(this.alias(), mail.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const updatedMails = this.mails().filter(m => m.id !== mail.id);
          this.mails.set(updatedMails);
          this.showToastMessage('success', 'Email deleted');
          this.closeMail();
        },
        error: (error) => {
          this.showToastMessage('error', 'Failed to delete email');
        }
      });
    */
  }

  goHome() {
    this.router.navigate(['/']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  formatDate(date: Date): string {
    return date.toLocaleTimeString();
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