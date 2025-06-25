import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
          Expires in {{ formatTime(timeLeft()) }}
        } @else {
          Expired
        }
      </span>
    </div>
  `
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input() expiresAt?: string;
  @Input() defaultMinutes = 60;

  timeLeft = signal(0);
  private intervalId?: number;

  ngOnInit() {
    this.calculateTimeLeft();
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private calculateTimeLeft() {
    const now = new Date().getTime();
    let targetTime: number;

    if (this.expiresAt) {
      targetTime = new Date(this.expiresAt).getTime();
    } else {
      // Default to 60 minutes from now
      targetTime = now + (this.defaultMinutes * 60 * 1000);
    }

    const difference = targetTime - now;
    this.timeLeft.set(Math.max(0, difference));
  }

  private startCountdown() {
    this.intervalId = window.setInterval(() => {
      this.calculateTimeLeft();
    }, 1000);
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