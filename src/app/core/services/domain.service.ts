import {Injectable, inject} from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Domain, AddDomainRequest, DeleteDomainResponse } from '../models/domain.model';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
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
