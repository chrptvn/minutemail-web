import {Component, signal, inject, OnInit, ElementRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TablerIconComponent } from '../icons/tabler-icons.component';
import { ButtonComponent } from '../ui/button.component';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, ButtonComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss'
})
export class ProfileMenuComponent implements OnInit{

  @ViewChild('menu', { static: true }) menu!: ElementRef<HTMLElement>;

  isOpen = signal(false);
  isAuthenticated = signal(false);

  private readonly router = inject(Router);
  private readonly keycloak = inject(Keycloak);

  toggleMenu() {
    this.isOpen.update(current => !current);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement | null;
    if (next && this.menu.nativeElement.contains(next)) {
      return;
    }
    this.closeMenu();
  }

  async login() {
    this.keycloak.login().then(() => {
      this.isAuthenticated.set(!!this.keycloak.authenticated);
      this.closeMenu();
    }).then(() => {
      this.closeMenu();
    })
  }

  async register() {
    this.keycloak.register().then(() => {
      this.closeMenu();
    })
  }

  async logout() {
    this.keycloak.logout().then(() => {
      this.isAuthenticated.set(!!this.keycloak.authenticated);
      this.router.navigate(['/']);
    }).then(() => {
      this.closeMenu();
    })
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role)
  }

  manageDomain() {
    this.router.navigate(['/manage-domain']);
  }

  manageApiKeys() {
    this.router.navigate(['/api-keys']);
  }

  ngOnInit(): void {
    this.isAuthenticated.set(!!this.keycloak.authenticated);
  }
}
