import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  standalone: true
})
export class App implements OnInit {
  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Ensure theme is properly initialized for browser platform
    if (isPlatformBrowser(this.platformId)) {
      // Force theme application immediately without delay
      const currentTheme = this.themeService.isDarkMode();
      this.themeService.isDarkMode.set(currentTheme);

      // Initialize Keycloak authentication only once
      if (!this.authService.keycloak) {
        this.authService.initKeycloak().then(authenticated => {
          console.log('App - Keycloak initialized, authenticated:', authenticated);
          console.log(this.authService.getToken())
        }).catch(error => {
          console.error('App - Keycloak initialization failed:', error);
        });
      }
    }
  }
}
