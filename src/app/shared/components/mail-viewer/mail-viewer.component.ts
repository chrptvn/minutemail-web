import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';
import { Mail } from '../../../core/models/mail.model';

@Component({
  selector: 'app-mail-viewer',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './mail-viewer.component.html',
  styleUrl: './mail-viewer.component.scss'
})
export class MailViewerComponent implements OnInit, OnDestroy {
  @Input() mail?: Mail;
  @Input() isOpen = false;

  @Output() onClose = new EventEmitter<void>();

  isBrowser = false;

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser && this.isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }

  ngOnChanges() {
    if (this.isBrowser) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
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

  closeModal() {
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
    this.onClose.emit();
  }
}