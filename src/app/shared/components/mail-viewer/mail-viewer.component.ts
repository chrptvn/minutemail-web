import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';
import { AttachmentListComponent } from '../attachment-list/attachment-list.component';
import { Mail } from '../../../core/models/mail.model';

@Component({
  selector: 'app-mail-viewer',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent, AttachmentListComponent],
  templateUrl: './mail-viewer.component.html',
  styleUrl: './mail-viewer.component.scss'
})
export class MailViewerComponent implements OnInit, OnDestroy {
  @Input() mail?: Mail;
  @Input() isOpen = false;
  @Input() aliasName?: string;

  @Output() onClose = new EventEmitter<void>();

  isBrowser = false;
  private originalBodyOverflow = '';
  private originalBodyHeight = '';

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
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

    // Store original values
    this.originalBodyOverflow = document.body.style.overflow;
    this.originalBodyHeight = document.body.style.height;

    // CRITICAL: Only prevent scroll on desktop, not mobile
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      // Only prevent body scroll on desktop
      document.body.style.overflow = 'hidden';
    } else {
      // On mobile, ensure body can still scroll
      document.body.style.overflow = 'auto';
      document.body.style.webkitOverflowScrolling = 'touch';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.webkitOverflowScrolling = 'touch';
    }
  }

  private restoreBodyScroll() {
    if (!this.isBrowser) return;

    // Always restore scrolling
    document.body.style.overflow = this.originalBodyOverflow || 'auto';
    document.body.style.height = this.originalBodyHeight || 'auto';
    document.body.style.webkitOverflowScrolling = 'touch';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.webkitOverflowScrolling = 'touch';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  isHtmlContent(content: string): boolean {
    return /<[a-z][\s\S]*>/i.test(content);
  }

  getSanitizedHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  getAliasName(): string {
    // Extract alias name from the current URL or use provided aliasName
    if (this.aliasName) {
      return this.aliasName;
    }
    
    if (this.isBrowser) {
      const pathSegments = window.location.pathname.split('/');
      return pathSegments[1] || '';
    }
    
    return '';
  }

  closeModal() {
    this.restoreBodyScroll();
    this.onClose.emit();
  }
}