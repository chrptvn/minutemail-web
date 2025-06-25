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
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
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