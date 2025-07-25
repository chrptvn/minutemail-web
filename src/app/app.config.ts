import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';

// Keycloak initialization function
function initializeKeycloak(keycloak: KeycloakService) {
  return () => {
    console.log('Starting Keycloak initialization...');
    
    return keycloak.init({
      config: {
        url: 'https://keycloak.minutemail.co',
        realm: 'minutemail',
        clientId: 'minutemail-web'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : undefined,
        checkLoginIframe: false,
        pkceMethod: 'S256',
        enableLogging: true, // Enable logging for debugging
        flow: 'standard'
      },
      bearerExcludedUrls: ['/assets', '/silent-check-sso.html']
    }).then((authenticated) => {
      console.log('Keycloak initialization completed. Authenticated:', authenticated);
      
      // Clean up URL after successful authentication
      if (typeof window !== 'undefined' && window.location.search.includes('state=') && window.location.search.includes('code=')) {
        console.log('Cleaning up authentication URL parameters...');
        const url = new URL(window.location.href);
        url.searchParams.delete('state');
        url.searchParams.delete('session_state');
        url.searchParams.delete('code');
        window.history.replaceState({}, document.title, url.toString());
      }
      
      return authenticated;
    }).catch((error) => {
      console.error('Keycloak initialization failed:', error);
      throw error;
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    
    // Provide KeycloakService
    KeycloakService,
    
    // Initialize Keycloak
    {
      provide: 'APP_INITIALIZER',
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true
    }
  ]
};