import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses" [attr.aria-label]="ariaLabel">
      <div [class]="spinnerClasses">
        <svg class="animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
          <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      @if (text) {
        <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">{{ text }}</span>
      }
    </div>
  `
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() text?: string;
  @Input() center = false;
  @Input() ariaLabel = 'Loading';

  get containerClasses(): string {
    const baseClasses = 'flex items-center';
    return this.center ? `${baseClasses} justify-center` : baseClasses;
  }

  get spinnerClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    };
    return `text-primary-500 ${sizeClasses[this.size]}`;
  }
}