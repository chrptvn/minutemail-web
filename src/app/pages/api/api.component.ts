import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import {TopMenu} from "../../shared/components/top-menu/top-menu";
import {FooterComponent} from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-api',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, TopMenu, FooterComponent],
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
