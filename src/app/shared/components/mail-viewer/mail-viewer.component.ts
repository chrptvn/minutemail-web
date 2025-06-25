import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class MailViewerComponent {
  @Input() mail?: Mail;
  @Input() isOpen = false;

  @Output() onClose = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  isHtmlContent(content: string): boolean {
    return /<[a-z][\s\S]*>/i.test(content);
  }

  getSanitizedHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }
}