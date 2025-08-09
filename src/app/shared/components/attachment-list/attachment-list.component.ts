import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';
import { AttachmentService } from '../../../core/services/attachment.service';
import { SessionService } from '../../../core/services/session.service';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  template: `
    @if (attachments && attachments.length > 0) {
      <div class="mt-6 border-t border-gray-200 dark:border-dark-700 pt-6">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <app-icon name="paperclip" [size]="16" class="mr-2 text-gray-500 dark:text-gray-400"></app-icon>
          Attachments ({{ attachments.length }})
        </h4>

        <div class="space-y-3">
          @for (attachment of attachments; track attachment) {
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              <div class="flex items-center space-x-3 min-w-0 flex-1">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <app-icon
                      [name]="attachmentService.getFileIcon(attachment)"
                      [size]="20"
                      class="text-primary-600 dark:text-primary-400"
                    ></app-icon>
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ attachment }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ getFileTypeLabel(attachment) }}
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2 flex-shrink-0">
                <app-button
                  variant="ghost"
                  size="sm"
                  (onClick)="downloadAttachment(attachment)"
                  ariaLabel="Download attachment"
                >
                  <app-icon name="download" [size]="16"></app-icon>
                </app-button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class AttachmentListComponent {
  @Input() attachments: string[] = [];
  @Input() aliasName: string = '';
  @Input() mailId: string = '';

  public readonly attachmentService = inject(AttachmentService);
  private readonly sessionService = inject(SessionService);
  private readonly keycloak: Keycloak = inject(Keycloak);

  private getRequestInit(): RequestInit {
    if (this.keycloak.authenticated) {
      return {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.keycloak.token}`,
          'X-Mailbox-Password': this.sessionService.getSessionId()
        }
      } as RequestInit;
    }

    return {
      method: 'GET',
      headers: {
        'X-Mailbox-Password': this.sessionService.getSessionId()
      }
    } as RequestInit;
  }

  getFileTypeLabel(filename: string): string {
    const extension = this.attachmentService.getFileExtension(filename).toLowerCase().toUpperCase();

    if (this.attachmentService.isImage(filename)) {
      return `${extension} Image`;
    } else if (this.attachmentService.isDocument(filename)) {
      return `${extension} Document`;
    } else if (this.attachmentService.isSpreadsheet(filename)) {
      return `${extension} Spreadsheet`;
    } else if (this.attachmentService.isPresentation(filename)) {
      return `${extension} Presentation`;
    } else if (this.attachmentService.isArchive(filename)) {
      return `${extension} Archive`;
    }

    return extension ? `${extension} File` : 'File';
  }

  downloadAttachment(filename: string): void {
    const url = this.attachmentService.getAttachmentUrl(this.aliasName, this.mailId, filename);
    const sessionId = this.sessionService.getSessionId();

    // Create a fetch request with authentication headers
    if (sessionId) {

      fetch(url, this.getRequestInit())
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch(error => {
        console.error('Download failed:', error);
      });
    }
  }
}
