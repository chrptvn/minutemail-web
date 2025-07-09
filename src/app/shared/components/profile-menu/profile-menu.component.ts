import { Component, OnInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss'
})
export class ProfileMenuComponent implements OnInit {
  isOpen = signal(false);
  isBrowser: boolean;

  constructor(
    public authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (this.isBrowser) {
      await this.authService.initKeycloak();
    }
  }

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  login() {
    this.authService.login();
    this.closeMenu();
  }

  register() {
    this.authService.register();
    this.closeMenu();
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
  }

  // Close menu when clicking outside
  onDocumentClick(event: Event) {
    if (!this.isBrowser) return;
    
    const target = event.target as HTMLElement;
    const menuElement = target.closest('.profile-menu');
    
    if (!menuElement && this.isOpen()) {
      this.closeMenu();
    }
  }
}