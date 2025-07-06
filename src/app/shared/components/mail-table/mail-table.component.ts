import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';
import { SpinnerComponent } from '../ui/spinner.component';
import { Mail } from '../../../core/models/mail.model';

@Component({
  selector: 'app-mail-table',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent, SpinnerComponent],
  templateUrl: './mail-table.component.html',
  styleUrl: './mail-table.component.scss'
})
export class MailTableComponent {
  @Input() mails: Mail[] = [];
  @Input() loading = false;
  @Input() deletingMailId?: string;

  @Output() onMailClick = new EventEmitter<Mail>();
  @Output() onDeleteMail = new EventEmitter<Mail>();

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  getEmailPreview(body: string): string {
    if (!body) return 'No content';
    
    // Remove HTML tags if present
    const textContent = body.replace(/<[^>]*>/g, '');
    
    // Get first 60 characters and add ellipsis if longer
    const preview = textContent.trim().substring(0, 60);
    return preview.length < textContent.trim().length ? `${preview}...` : preview;
  }
}