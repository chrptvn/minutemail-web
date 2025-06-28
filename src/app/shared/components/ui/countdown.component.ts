import {CommonModule, isPlatformBrowser} from '@angular/common';
import { Component, Input, OnInit, OnDestroy, signal, Inject, PLATFORM_ID } from '@angular/core';
import { TablerIconComponent } from '../icons/tabler-icons.component';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule, TablerIconComponent],
  template: `
    <div class="flex items-center space-x-2 text-sm">
      <app-icon name="clock" [size]="16" class="text-gray-500 dark:text-gray-400"></app-icon>
      <span [class]="textClasses">
        @if (timeLeft() > 0) {
          {{ formatTime(timeLeft()) }}
        } @else {
          Expired
        }
      </span>
    </div>
  `
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input() expiresAt?: string | null;
  @Input() defaultMinutes = 60;

  timeLeft = signal(0);
  private intervalId?: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.calculateTimeLeft();

    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => {
        this.calculateTimeLeft();
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private calculateTimeLeft() {
    const now = Date.now();
    const target = this.expiresAt
      ? new Date(this.expiresAt).getTime()
      : now + this.defaultMinutes * 60_000;

    this.timeLeft.set(Math.max(0, target - now));
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  get textClasses(): string {
    const remaining = this.timeLeft();
    if (remaining <= 0) {
      return 'text-red-500 font-medium';
    } else if (remaining < 5 * 60 * 1000) { // Less than 5 minutes
      return 'text-orange-500 font-medium';
    } else {
      return 'text-gray-600 dark:text-gray-400';
    }
  }
}