import {Injectable, inject} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {defer, Observable, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import Keycloak from 'keycloak-js';
import {Subscription, SubscriptionResponse} from '../models/subscription.model';
import {Membership} from '../models/membership.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly keycloak: Keycloak = inject(Keycloak);
  private readonly baseUrl = environment.apiBase;
  private readonly http = inject(HttpClient);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (this.keycloak.authenticated) {
        headers = headers.set('Authorization', `Bearer ${this.keycloak.token}`);
    }

    return headers;
  }

  subscribe(subscription: Subscription): Observable<SubscriptionResponse> {
    return defer(() => {
      const url = `${this.baseUrl}/membership/subscribe`;
      const headers = this.getAuthHeaders();
      return this.http.post<SubscriptionResponse>(url,  subscription, { headers })
    }).pipe(catchError(this.handleError));
  }

  update(subscription: Subscription): Observable<SubscriptionResponse> {
    return defer(() => {
      const url = `${this.baseUrl}/membership/update`;
      const headers = this.getAuthHeaders();
      return this.http.post<SubscriptionResponse>(url,  subscription, { headers })
    }).pipe(catchError(this.handleError));
  }

  getMembership(): Observable<Membership> {
    return defer(() => {
      const url = `${this.baseUrl}/membership/current`;
      const headers = this.getAuthHeaders();
      return this.http.get<Membership>(url, { headers });
    }).pipe(catchError(this.handleError));
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
