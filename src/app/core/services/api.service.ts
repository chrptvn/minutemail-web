import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import {Observable, of, throwError} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Mail, MailResponse } from '../models/mail.model';
import {RegisterModel} from '../models/register.model';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiBase;

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getMails(alias: string): Observable<MailResponse> {
    const url = `${this.baseUrl}/mailbox/${alias}`;

    // Get session ID to use as password
    const sessionId = this.sessionService.getSessionId();

    // Create headers with session ID as X-Mailbox-Password if available
    let headers = new HttpHeaders();
    if (sessionId) {
      headers = headers.set('X-Mailbox-Password', sessionId);
    }

    return this.http
      .get<MailResponse>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  createMailBox(sessionId?: string): Observable<RegisterModel> {
    const url = `${this.baseUrl}/mailbox/create`;

    // Create request body with session ID as password if provided
    const requestBody = sessionId ? {
      password: sessionId,
      source: 'web'
    } : {};

    return this.http
      .post<RegisterModel>(url, requestBody)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteMail(alias: string, mailId: string): Observable<{ message: string }> {
    const url = `${this.baseUrl}/mailbox/${alias}/mail/${mailId}`;

    // Get session ID to use as password
    const sessionId = this.sessionService.getSessionId();

    // Create headers with session ID as X-Mailbox-Password if available
    let headers = new HttpHeaders();
    if (sessionId) {
      headers = headers.set('X-Mailbox-Password', sessionId);
    }

    return this.http
      .delete<{ message: string }>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An error occurred';

    console.error('API Error:', error);

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = isPlatformBrowser(this.platformId)
            ? 'Unable to connect to the server. Please check your internet connection.'
            : 'Server connection failed during SSR';
          break;
        case 401:
          errorMessage = 'Unauthorized access. Session may have expired.';
          break;
        case 404:
          errorMessage = 'Inbox not found or expired';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message || 'Unknown error'}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
