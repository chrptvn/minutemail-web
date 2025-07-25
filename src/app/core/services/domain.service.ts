import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Domain, DomainListResponse, AddDomainRequest, DeleteDomainResponse } from '../models/domain.model';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  private readonly baseUrl = environment.apiBase;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();

    if (this.isBrowser) {
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
          const jwt = localStorage.getItem('kc_token');
          if (jwt) {
            headers = headers.set('Authorization', `Bearer ${jwt}`);
          }
        }
      } catch (error) {
        console.warn('Error getting Keycloak token:', error);
        // Fallback to localStorage
        const jwt = localStorage.getItem('kc_token');
      if (jwt) {
        headers = headers.set('Authorization', `Bearer ${jwt}`);
      }
      }
    }

    return headers;
  }

  addDomain(request: AddDomainRequest): Observable<Domain> {
    const url = `${this.baseUrl}/domains`;
    const headers = this.getAuthHeaders();

    return this.http
      .post<Domain>(url, request, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getDomains(): Observable<Domain[]> {
    const url = `${this.baseUrl}/domains`;
    const headers = this.getAuthHeaders();

    return this.http
      .get<Domain[]>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteDomain(domain: string): Observable<DeleteDomainResponse> {
    const url = `${this.baseUrl}/domains/${encodeURIComponent(domain)}`;
    const headers = this.getAuthHeaders();

    return this.http
      .delete<DeleteDomainResponse>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }


  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An error occurred';

    console.error('Domain Service Error:', error);

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 401:
          errorMessage = 'Unauthorized access. Please sign in again.';
          break;
        case 403:
          errorMessage = 'Access forbidden. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Domain not found.';
          break;
        case 409:
          errorMessage = 'Domain already exists or conflict occurred.';
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