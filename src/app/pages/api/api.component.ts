import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';

@Component({
  selector: 'app-api',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TablerIconComponent],
  templateUrl: './api.component.html',
  styleUrl: './api.component.scss'
})
export class ApiComponent {
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