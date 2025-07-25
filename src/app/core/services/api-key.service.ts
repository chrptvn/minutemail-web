import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiKey, CreateApiKeyRequest, DeleteApiKeyResponse } from '../models/api-key.model';

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
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

  createApiKey(request: CreateApiKeyRequest): Observable<ApiKey> {
    const url = `${this.baseUrl}/apikey/create`;
    const headers = this.getAuthHeaders();

    return this.http
      .post<ApiKey>(url, request, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getApiKeys(): Observable<{ apiKeys: ApiKey[] }> {
    const url = `${this.baseUrl}/apikey/list`;
    const headers = this.getAuthHeaders();

    return this.http
      .get<ApiKey[] | { apiKeys: ApiKey[] }>(url, { headers })
      .pipe(
        map(response => {
          // Handle both array response and wrapped response
          if (Array.isArray(response)) {
            return { apiKeys: response };
          }
          return response as { apiKeys: ApiKey[] };
        }),
        catchError(this.handleError)
      );
  }

  deleteApiKey(keyId: string): Observable<DeleteApiKeyResponse> {
    const url = `${this.baseUrl}/apikey/${keyId}`;
    const headers = this.getAuthHeaders();

    return this.http
      .delete<DeleteApiKeyResponse>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An error occurred';

    console.error('API Key Service Error:', error);

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
          errorMessage = 'API key not found.';
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
