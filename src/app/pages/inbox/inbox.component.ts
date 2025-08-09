import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { timer, Subject, switchMap, takeUntil, catchError, of } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { AliasService } from '../../core/services/alias.service';
import { ClipboardService } from '../../core/services/clipboard.service';

import { Mail } from '../../core/models/mail.model';

import { MailTableComponent } from '../../shared/components/mail-table/mail-table.component';
import { MailViewerComponent } from '../../shared/components/mail-viewer/mail-viewer.component';
import { CountdownComponent } from '../../shared/components/ui/countdown.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner.component';
import { VpnBannerComponent } from '../../shared/components/vpn-banner/vpn-banner.component';
import {FooterComponent} from '../../shared/components/footer/footer.component';
import {TopMenu} from '../../shared/components/top-menu/top-menu';

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
    SpinnerComponent,
    VpnBannerComponent,
    FooterComponent,
    TopMenu
  ],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {
  alias = signal<string>('');
  fullAlias = signal<string>('');
  mails = signal<Mail[]>([]);
  selectedMail = signal<Mail | undefined>(undefined);
  isMailViewerOpen = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  expiresAt = signal<string | undefined | null>(undefined);
  lastUpdated = signal<Date>(new Date());

  copying = signal(false);
  copied = signal(false);
  deletingMailId = signal<string | undefined>(undefined);

  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  private readonly destroy$ = new Subject<void>();
  private readonly POLL_INTERVAL = 5000;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService,
    private readonly aliasService: AliasService,
    private readonly clipboardService: ClipboardService,
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this.destroy$),
    ).subscribe(params => {
      const emailParam = params['email'];
      if (!emailParam) {
        this.router.navigate(['/']);
        return;
      }

      const fullEmail = emailParam;
      const aliasName = this.aliasService.extractAliasFromEmail(fullEmail);
      
      this.alias.set(aliasName);
      this.fullAlias.set(fullEmail);
      this.aliasService.setCurrentAlias(this.fullAlias());

      this.loadMails(false);
      this.startPolling();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  private startPolling() {
    // initial load
    this.loadMails(true);

    timer(this.POLL_INTERVAL, this.POLL_INTERVAL)
      .pipe(
        switchMap(() => this.apiService.getMails(this.alias())),
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Polling error:', err);
          return of({ mails: [], expireAt: undefined });
        })
      )
      .subscribe(
        {
          next : (response) => {
            const newMails = response.mails ?? [];
            const currentMails = this.mails();
            const hasNew = newMails.some(m => !currentMails.find(c => c.id === m.id));

            if (hasNew) {
              this.showToastMessage('info', 'New email received!');
            }

            this.mails.set(newMails);
            this.lastUpdated.set(new Date());

            if (response.expireAt) {
              this.expiresAt.set(response.expireAt);
            }
          },
          error: err => {
            console.error('Polling error:', err);
            this.error.set(err.message);
            this.showToastMessage('error', 'Failed to refresh emails');
          }
      });
  }

  private loadMails(showLoading = false) {
    if (showLoading) {
      this.loading.set(true);
    }
    this.error.set(null);

    this.apiService.getMails(this.alias())
      .subscribe({
        next: resp => {
          this.mails.set(resp.mails ?? []);
          this.lastUpdated.set(new Date());

          if (resp.expireAt) {
            this.expiresAt.set(resp.expireAt);
          }

          this.loading.set(false);
        },
        error: err => {
          this.error.set(err.message);
          this.loading.set(false);
          this.showToastMessage('error', err.message);
        }
      });
  }

  refreshMails() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  async copyEmailAddress() {
    if (!isPlatformBrowser(this.platformId)) return;

    const email = this.fullAlias();
    this.copying.set(true);

    try {
      const success = await this.clipboardService.copyToClipboard(email);
      this.copied.set(success);

      if (!success) {
        this.showToastMessage('error', 'Failed to copy to clipboard');
      }

      setTimeout(() => this.copied.set(false), 2000);
    } finally {
      this.copying.set(false);
    }
  }

  openMail(mail: Mail) {
    this.selectedMail.set(mail);
    this.isMailViewerOpen.set(true);
  }

  closeMail() {
    this.isMailViewerOpen.set(false);
    this.selectedMail.set(undefined);
  }

  formatDate(date: Date): string {
    return date.toLocaleTimeString();
  }

  private showToastMessage(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    this.toastType.set(type);
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.hideToast(), 5000);
  }

  hideToast() {
    this.showToast.set(false);
  }

  deleteMail(mail: Mail) {
    if (!isPlatformBrowser(this.platformId) || this.deletingMailId()) {
      return;
    }

    this.deletingMailId.set(mail.id);

    this.apiService.deleteMail(this.alias(), mail.id)
      .subscribe({
        next: () => {
          this.mails.set(this.mails().filter(m => m.id !== mail.id));
          this.showToastMessage('success', 'Email deleted successfully');
          this.deletingMailId.set(undefined);
        },
        error: err => {
          console.error('Error deleting mail:', err);
          this.showToastMessage('error', 'Failed to delete email');
          this.deletingMailId.set(undefined);
        }
      });
  }

  onMailDeleted(mailId: string) {
    this.mails.set(this.mails().filter(m => m.id !== mailId));

    if (this.selectedMail()?.id === mailId) {
      this.closeMail();
    }
    this.showToastMessage('success', 'Email deleted successfully');
  }
}
