import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from './button.component';
import { Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-token-status',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  template: `
    @if (showStatus()) {
      <div class="fixed top-4 right-4 z-40 max-w-sm">
        <div [class]="getStatusCardClass()">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <app-icon [name]="getStatusIcon()" [size]="16" [class]="getStatusIconClass()"></app-icon>
              <span class="text-sm font-medium">{{ getStatusText() }}</span>
            </div>
            @if (canRefresh()) {
              <app-button
                variant="ghost"
                size="sm"
                [loading]="refreshing()"
                (onClick)="refreshToken()"
                ariaLabel="Refresh token"
              >
                <app-icon name="refresh" [size]="14"></app-icon>
              </app-button>
            }
          </div>
          @if (timeUntilExpiry() > 0) {
            <div class="mt-1 text-xs opacity-75">
              Expires in {{ formatTime(timeUntilExpiry()) }}
            </div>
          }
        </div>
      </div>
    }
  `
})
export class TokenStatusComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  showStatus = signal(false);
  timeUntilExpiry = signal(0);
  refreshing = signal(false);

  ngOnInit() {
    // Update token status every second
    timer(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateTokenStatus();
      });

    // Subscribe to auth status changes
    this.authService.getAuthStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateTokenStatus();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTokenStatus() {
    if (!this.authService.isAuthenticated()) {
      this.showStatus.set(false);
      return;
    }

    const expiration = this.authService.getTokenExpiration();
    if (!expiration) {
      this.showStatus.set(false);
      return;
    }

    const now = Date.now();
    const timeLeft = expiration.getTime() - now;
    this.timeUntilExpiry.set(Math.max(0, timeLeft));

    // Show status if token expires in less than 5 minutes
    this.showStatus.set(timeLeft < 5 * 60 * 1000 && timeLeft > 0);
  }

  async refreshToken() {
    this.refreshing.set(true);
    try {
      await this.authService.refreshToken();
    } catch (error) {
      console.error('Manual token refresh failed:', error);
    } finally {
      this.refreshing.set(false);
    }
  }

  canRefresh(): boolean {
    return this.timeUntilExpiry() > 0;
  }

  getStatusCardClass(): string {
    const timeLeft = this.timeUntilExpiry();
    const baseClasses = 'p-3 rounded-lg border shadow-lg';
    
    if (timeLeft <= 0) {
      return `${baseClasses} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200`;
    } else if (timeLeft < 2 * 60 * 1000) { // Less than 2 minutes
      return `${baseClasses} bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200`;
    } else {
      return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200`;
    }
  }

  getStatusIcon(): string {
    const timeLeft = this.timeUntilExpiry();
    if (timeLeft <= 0) {
      return 'alert-circle';
    } else if (timeLeft < 2 * 60 * 1000) {
      return 'alert-triangle';
    } else {
      return 'clock';
    }
  }

  getStatusIconClass(): string {
    const timeLeft = this.timeUntilExpiry();
    if (timeLeft <= 0) {
      return 'text-red-600 dark:text-red-400';
    } else if (timeLeft < 2 * 60 * 1000) {
      return 'text-orange-600 dark:text-orange-400';
    } else {
      return 'text-yellow-600 dark:text-yellow-400';
    }
  }

  getStatusText(): string {
    const timeLeft = this.timeUntilExpiry();
    if (timeLeft <= 0) {
      return 'Session expired';
    } else if (timeLeft < 2 * 60 * 1000) {
      return 'Session expiring soon';
    } else {
      return 'Session expires soon';
    }
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}