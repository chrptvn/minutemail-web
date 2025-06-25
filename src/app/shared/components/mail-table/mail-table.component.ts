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

  @Output() onMailClick = new EventEmitter<Mail>();
  @Output() onDeleteClick = new EventEmitter<{ event: Event; mail: Mail }>();

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  onDeleteClick(event: Event, mail: Mail): void {
    event.stopPropagation();
    this.onDeleteClick.emit({ event, mail });
  }
}