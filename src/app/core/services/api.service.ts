import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import {Observable, of, throwError} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Mail, MailResponse } from '../models/mail.model';
import {RegisterModel} from '../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiBase;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getMails(alias: string): Observable<MailResponse> {
    const url = `${this.baseUrl}/mails/${alias}`;

    return this.http
      .get<MailResponse>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  registerMail(alias: string): Observable<RegisterModel> {
    const url = `${this.baseUrl}/mails/${alias}`;

    return this.http
      .post(url, {})
      .pipe(
        map(response => response as RegisterModel),
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
