import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ProfileMenuComponent } from '../../shared/components/profile-menu/profile-menu.component';

@Component({
  selector: 'app-mx-configuration',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TablerIconComponent, ProfileMenuComponent],
  templateUrl: './mx-configuration.component.html',
  styleUrl: './mx-configuration.component.scss'
})
export class MxConfigurationComponent implements OnInit {
  domainName = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    // Get domain name from query parameters
    this.route.queryParams.subscribe(params => {
      if (params['domain']) {
        this.domainName.set(params['domain']);
      }
    });
  }

  goBack() {
    // Go back to the previous page or manage domain if no history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.goToManageDomain();
    }
  }

  goToManageDomain() {
    this.router.navigate(['/manage-domain']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}