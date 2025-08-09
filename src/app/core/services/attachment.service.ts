import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private readonly baseUrl = environment.apiBase;

  /**
   * Generate the full URL for an attachment
   */
  getAttachmentUrl(aliasName: string, mailId: string, filename: string): string {
    return `${this.baseUrl}/mailbox/${aliasName}/mail/${mailId}/attachment/${filename}`;
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() ?? '';
  }

  /**
   * Check if file is an image
   */
  isImage(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Check if file is a document
   */
  isDocument(filename: string): boolean {
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    return docExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Check if file is a spreadsheet
   */
  isSpreadsheet(filename: string): boolean {
    const spreadsheetExtensions = ['xls', 'xlsx', 'csv', 'ods'];
    return spreadsheetExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Check if file is a presentation
   */
  isPresentation(filename: string): boolean {
    const presentationExtensions = ['ppt', 'pptx', 'odp'];
    return presentationExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Check if file is an archive
   */
  isArchive(filename: string): boolean {
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
    return archiveExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Get appropriate icon name for file type
   */
  getFileIcon(filename: string): string {
    if (this.isImage(filename)) return 'image';
    if (this.isDocument(filename)) return 'file-text';
    if (this.isSpreadsheet(filename)) return 'table';
    if (this.isPresentation(filename)) return 'presentation';
    if (this.isArchive(filename)) return 'archive';
    return 'file';
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
