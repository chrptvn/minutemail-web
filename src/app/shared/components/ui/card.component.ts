import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      @if (title) {
        <div class="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
          @if (subtitle) {
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ subtitle }}</p>
          }
        </div>
      }
      <div [class]="contentClasses">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding = true;
  @Input() customClass = '';

  get cardClasses(): string {
    return `card ${this.customClass}`;
  }

  get contentClasses(): string {
    return this.padding ? 'p-6' : '';
  }
}