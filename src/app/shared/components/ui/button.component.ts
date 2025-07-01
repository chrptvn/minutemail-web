import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="onClick.emit($event)"
      [attr.data-event]="dataEvent"
      [attr.data-props]="dataPropsJson"
      [attr.aria-label]="ariaLabel"
    >
      <ng-content></ng-content>
      <ng-container *ngIf="loading">
        <div class="ml-2 animate-spin">
          <svg class="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
            <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </ng-container>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() ariaLabel?: string;

  /** Optional Plausible event name */
  @Input() dataEvent?: string;

  /** Optional Plausible props as an object */
  @Input() dataProps?: Record<string, any>;

  @Output() onClick = new EventEmitter<Event>();

  /** JSON-stringified props or null if none */
  get dataPropsJson(): string | null {
    return this.dataProps ? JSON.stringify(this.dataProps) : null;
  }

  get buttonClasses(): string {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary:   'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md',
      secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-900 dark:text-gray-100',
      ghost:     'hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-300',
      danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
    };
    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
      md: 'px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-sm',
      lg: 'px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base',
    };
    return `${base} ${variants[this.variant]} ${sizes[this.size]}`;
  }
}
