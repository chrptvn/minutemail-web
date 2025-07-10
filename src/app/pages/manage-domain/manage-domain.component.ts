import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ProfileMenuComponent } from '../../shared/components/profile-menu/profile-menu.component';

@Component({
  selector: 'app-manage-domain',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TablerIconComponent, ProfileMenuComponent],
  templateUrl: './manage-domain.component.html',
  styleUrl: './manage-domain.component.scss'
})
export class ManageDomainComponent {
  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {}

  goHome() {
    this.router.navigate(['/']);
  }

  goToApi() {
    this.router.navigate(['/api']);
  }

  goToPrivacy() {
    this.router.navigate(['/privacy']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}