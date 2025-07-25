import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import {defer, Observable, of, throwError} from 'rxjs';
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

  private prepareRequestHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const sessionId = this.sessionService.getOrCreateSessionId()
    headers = headers.set('X-Mailbox-Password', sessionId);
    
    // Try to get token from Keycloak service if available
    try {
      const keycloakService = (window as any).keycloakService;
      if (keycloakService && keycloakService.getToken) {
        const token = keycloakService.getToken();
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
      } else {
        // Fallback to localStorage
        const jwt: string | null = localStorage.getItem('kc_token');
        if (jwt) {
          headers = headers.set('Authorization', `Bearer ${jwt}`);
        }
      }
    } catch (error) {
      console.warn('Error getting Keycloak token:', error);
      // Fallback to localStorage
      const jwt: string | null = localStorage.getItem('kc_token');
      if (jwt) {
        headers = headers.set('Authorization', `Bearer ${jwt}`);
      }
    }

    return headers;
  }

  getMails(alias: string): Observable<MailResponse> {
    const url = `${this.baseUrl}/mailbox/${alias}`;
    const headers = this.prepareRequestHeaders();

    return this.http
      .get<MailResponse>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  createMailBox(): Observable<RegisterModel> {
    return defer(() => {
      const url = `${this.baseUrl}/mailbox/create`;
      const headers = this.prepareRequestHeaders();
      return this.http.post<RegisterModel>(url,  {source: 'web'}, { headers })
    }).pipe(catchError(this.handleError));
  }

  deleteMail(alias: string, mailId: string): Observable<{ message: string }> {
    const url = `${this.baseUrl}/mailbox/${alias}/mail/${mailId}`;
    const headers = this.prepareRequestHeaders();

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
