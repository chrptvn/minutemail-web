import {Injectable, inject} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {defer, Observable, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MailResponse } from '../models/mail.model';
import {RegisterModel} from '../models/register.model';
import Keycloak from 'keycloak-js';
import {SessionService} from './session.service';

@Injectable({
  providedIn: 'root'
})
export class MailBoxService {
  private readonly keycloak: Keycloak = inject(Keycloak);
  private readonly baseUrl = environment.apiBase;
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.set('X-Mailbox-Password', this.sessionService.getOrCreateSessionId());
    if (this.keycloak.authenticated) {
        headers = headers.set('Authorization', `Bearer ${this.keycloak.token}`);
    }

    return headers;
  }

  getMails(alias: string): Observable<MailResponse> {
    const url = `${this.baseUrl}/mailbox/${alias}`;
    const headers = this.getAuthHeaders();

    return this.http
      .get<MailResponse>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  createMailBox(domain = 'minutemail.co'): Observable<RegisterModel> {
    return defer(() => {
      const url = `${this.baseUrl}/mailbox`;
      const headers = this.getAuthHeaders();
      return this.http.post<RegisterModel>(url, { domain }, { headers })
    }).pipe(catchError(this.handleError));
  }

  deleteMail(alias: string, mailId: string): Observable<{ message: string }> {
    const url = `${this.baseUrl}/mailbox/${alias}/mail/${mailId}`;
    const headers = this.getAuthHeaders();

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
