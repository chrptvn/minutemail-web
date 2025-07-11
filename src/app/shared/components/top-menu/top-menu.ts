import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {ButtonComponent} from '../ui/button.component';
import {TablerIconComponent} from '../icons/tabler-icons.component';
import {ProfileMenuComponent} from '../profile-menu/profile-menu.component';
import {DocsMenuComponent} from '../docs-menu/docs-menu.component';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [
    ButtonComponent,
    TablerIconComponent,
    ProfileMenuComponent,
    DocsMenuComponent
  ],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.scss'
})
export class TopMenu {
  constructor(
    private router: Router,
  ) {}

  goToPrivacy() {
    this.router.navigate(['/privacy']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  isHome(): boolean {
    return this.router.url === '/';
  }
}
