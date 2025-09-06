import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  template: `
    @if (isOpen && isBrowser) {
      <div class="fixed inset-0 z-50 overflow-hidden modal-overlay" [attr.aria-labelledby]="modalId + '-title'">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 modal-backdrop"
          (click)="onBackdropClick()"
          aria-hidden="true"
        ></div>
        
        <!-- Modal -->
        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-dark-900 rounded-xl shadow-2xl border border-gray-200 dark:border-dark-700 w-full max-w-md modal-content">
            <!-- Header -->
            @if (title) {
              <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
                <h2 [id]="modalId + '-title'" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ title }}
                </h2>
                @if (showCloseButton) {
                  <app-button
                    variant="ghost"
                    size="sm"
                    (onClick)="close()"
                    ariaLabel="Close modal"
                    class="flex-shrink-0"
                  >
                    <app-icon name="x" [size]="18" class="text-gray-700 dark:text-gray-300"></app-icon>
                  </app-button>
                }
              </div>
            }
            
            <!-- Content -->
            <div class="p-6">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      backdrop-filter: blur(4px);
      animation: fadeIn 0.3s ease-out;
    }

    .modal-content {
      animation: slideInUp 0.3s ease-out;
      max-height: 90vh;
      overflow-y: auto;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Mobile optimizations */
    @media (max-width: 640px) {
      .modal-content {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
      }
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() showCloseButton = true;
  @Input() closeOnBackdrop = true;
  @Input() modalId = 'modal';

  @Output() onClose = new EventEmitter<void>();

  isBrowser = false;
  private originalBodyOverflow = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser && this.isOpen) {
      this.preventBodyScroll();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      this.restoreBodyScroll();
    }
  }

  ngOnChanges() {
    if (this.isBrowser) {
      if (this.isOpen) {
        this.preventBodyScroll();
      } else {
        this.restoreBodyScroll();
      }
    }
  }

  private preventBodyScroll() {
    if (!this.isBrowser) return;

    this.originalBodyOverflow = document.body.style.overflow;
    
    // Only prevent scroll on desktop, not mobile
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      document.body.style.overflow = 'hidden';
    }
  }

  private restoreBodyScroll() {
    if (!this.isBrowser) return;
    document.body.style.overflow = this.originalBodyOverflow || 'auto';
  }

  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }

  close() {
    this.restoreBodyScroll();
    this.onClose.emit();
  }
}