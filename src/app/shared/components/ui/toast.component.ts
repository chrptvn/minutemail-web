import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../icons/tabler-icons.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, TablerIconComponent],
  template: `
    <div [class]="toastClasses" class="animate-slide-in">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <app-icon [name]="iconName" [size]="18" [class]="iconClasses" class="sm:w-5 sm:h-5"></app-icon>
        </div>
        <div class="ml-2 sm:ml-3 flex-1">
          <p [class]="messageClasses">{{ message }}</p>
        </div>
        <div class="ml-2 sm:ml-4 flex-shrink-0">
          <button
            type="button"
            class="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-ring rounded p-1"
            (click)="onClose.emit()"
            aria-label="Close notification"
          >
            <app-icon name="x" [size]="16" class="sm:w-5 sm:h-5"></app-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message = '';
  @Output() onClose = new EventEmitter<void>();

  get toastClasses(): string {
    const baseClasses = 'max-w-sm w-full bg-white dark:bg-dark-900 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 dark:ring-dark-700';
    const typeClasses = {
      success: 'border-l-4 border-green-400',
      error: 'border-l-4 border-red-400',
      warning: 'border-l-4 border-yellow-400',
      info: 'border-l-4 border-blue-400'
    };
    return `${baseClasses} ${typeClasses[this.type]} p-3 sm:p-4`;
  }

  get iconName(): string {
    const icons = {
      success: 'check',
      error: 'x',
      warning: 'alert-triangle',
      info: 'info'
    };
    return icons[this.type] || 'info';
  }

  get iconClasses(): string {
    const colors = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400'
    };
    return colors[this.type];
  }

  get messageClasses(): string {
    return 'text-xs sm:text-sm text-gray-900 dark:text-gray-100';
  }
}