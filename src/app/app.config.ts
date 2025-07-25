import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideKeycloak} from 'keycloak-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'https://keycloak.minutemail.co',
        realm: 'minutemail',
        clientId: 'minutemail-web'
      } as any,
      initOptions: {
        onLoad: 'check-sso', // or 'login-required'
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
      } as any
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideClientHydration(withEventReplay())
  ]
};
