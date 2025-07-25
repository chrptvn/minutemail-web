import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';

// Keycloak initialization function
function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
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
        enableLogging: false,
        flow: 'standard',
        // Handle URL cleanup after authentication
        checkLoginIframeInterval: 5
      },
      // Add bearer excluded URLs to avoid token issues
      bearerExcludedUrls: ['/assets', '/silent-check-sso.html']
    }).then(() => {
      // Clean up URL after successful authentication
      if (typeof window !== 'undefined' && window.location.search.includes('state=') && window.location.search.includes('code=')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('state');
        url.searchParams.delete('session_state');
        url.searchParams.delete('code');
        window.history.replaceState({}, document.title, url.toString());
      }
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    // Remove client hydration since we're not doing SSR
    // provideClientHydration(withEventReplay()),
    
    // Provide KeycloakService explicitly
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