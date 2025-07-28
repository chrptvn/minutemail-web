import { Component, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';

@Component({
  selector: 'app-docs-menu',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './docs-menu.component.html',
  styleUrl: './docs-menu.component.scss'
})
export class DocsMenuComponent {
  isOpen = signal(false);
  isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  goToApi() {
    this.router.navigate(['/api']);
    this.closeMenu();
  }

  goToMxConfiguration() {
    this.router.navigate(['/mx-configuration']);
    this.closeMenu();
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
    this.closeMenu();
  }

  // Close menu when clicking outside
  onDocumentClick(event: Event) {
    if (!this.isBrowser) return;

    const target = event.target as HTMLElement;
    const menuElement = target.closest('.docs-menu');

    if (!menuElement && this.isOpen()) {
      this.closeMenu();
    }
  }
}