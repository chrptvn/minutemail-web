import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Mail, MailResponse } from '../models/mail.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiBase;

  constructor(private http: HttpClient) {}

  getMails(alias: string): Observable<MailResponse> {
    const url = `${this.baseUrl}/mails/${alias}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        // Handle null or undefined response
        if (!response) {
          return { mails: [], expiresAt: undefined };
        }
        
        // Handle different response formats
        if (Array.isArray(response)) {
          return { mails: response, expiresAt: undefined };
        }
        
        // Handle object response with mails property
        if (response && typeof response === 'object') {
          return { 
            mails: response.mails || [], 
            expiresAt: response.expiresAt || undefined 
          };
        }
        
        // Fallback for unexpected format
        return { mails: [], expiresAt: undefined };
      }),
      catchError(this.handleError)
    );
  }

  deleteMail(alias: string, mailId: string): Observable<void> {
    const url = `${this.baseUrl}/mails/${alias}/${mailId}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
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