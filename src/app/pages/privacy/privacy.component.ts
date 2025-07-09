import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ProfileMenuComponent } from '../../shared/components/profile-menu/profile-menu.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TablerIconComponent, ProfileMenuComponent],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {}

  goHome() {
    this.router.navigate(['/']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}