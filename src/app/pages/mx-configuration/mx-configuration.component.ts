import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import {DnsBannerComponent} from '../../shared/components/dns-banner/dns-banner.component';
import {TopMenu} from '../../shared/components/top-menu/top-menu';
import {FooterComponent} from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-mx-configuration',
  standalone: true,
  imports: [CommonModule, TablerIconComponent, DnsBannerComponent, TopMenu, FooterComponent],
  templateUrl: './mx-configuration.component.html',
  styleUrl: './mx-configuration.component.scss'
})
export class MxConfigurationComponent implements OnInit {
  domainName = signal<string | null>(null);
  expandedFaqItems = new Set<number>();

  faqItems = [
    {
      question: "Does MinuteMail send mail from my domain?",
      answer: "No. MinuteMail is receive‑only. There is no outbound mail, so SPF, DKIM and DMARC are unnecessary."
    },
    {
      question: "Can I set a custom TTL?",
      answer: "MinuteMail has no TTL requirement. Use the default value offered by your DNS provider."
    },
    {
      question: "Will I need to update this later?",
      answer: "If we add extra inbound hosts (mx2.minutemail.co, etc.) for redundancy, we'll let you know. You'll simply add another MX record with a higher priority number."
    }
  ];

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

  toggleFaqItem(index: number) {
    if (this.expandedFaqItems.has(index)) {
      this.expandedFaqItems.delete(index);
    } else {
      this.expandedFaqItems.add(index);
    }
  }

  isFaqExpanded(index: number): boolean {
    return this.expandedFaqItems.has(index);
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
