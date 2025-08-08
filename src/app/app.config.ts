import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideKeycloak } from 'keycloak-angular';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'https://keycloak.minutemail.co',
        realm: 'minutemail',
        clientId: 'minutemail-web'
      } as any,
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : undefined,
        checkLoginIframe: false,
        pkceMethod: 'S256'
      } as any,
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideClientHydration(withEventReplay())
  ]
};
