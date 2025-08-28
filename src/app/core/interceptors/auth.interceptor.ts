import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import Keycloak from 'keycloak-js';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const keycloak = inject(Keycloak);

  // Clone the request and add auth header if authenticated
  let authReq = req;
  
  if (keycloak.authenticated && keycloak.token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${keycloak.token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 and user is supposed to be authenticated, try to refresh token
      if (error.status === 401 && keycloak.authenticated) {
        console.log('Received 401, attempting token refresh...');
        
        return authService.refreshToken().then(refreshed => {
          if (refreshed && keycloak.token) {
            // Retry the request with new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${keycloak.token}`
              }
            });
            return next(retryReq);
          } else {
            // Refresh failed, redirect to login
            console.warn('Token refresh failed, redirecting to login');
            keycloak.login();
            return throwError(() => error);
          }
        }).catch(() => {
          // Refresh failed, redirect to login
          console.warn('Token refresh failed, redirecting to login');
          keycloak.login();
          return throwError(() => error);
        });
      }

      return throwError(() => error);
    })
  );
};