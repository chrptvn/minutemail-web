import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { TeamService } from '../../core/services/team.service';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule, TopMenu, FooterComponent],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.scss'
})
export class InviteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);
  private readonly keycloak = inject(Keycloak);

  ngOnInit() {
    // Get uid parameter from query string
    this.route.queryParams.subscribe(params => {
      const key = params['uid'];

      // Log uid
      console.log('uid:', key);

      // Check authentication status and log
      if (this.keycloak.authenticated) {
        console.log('connected');
        // Call accept endpoint and redirect to home
        this.acceptInvitation(key);
      }
    });
  }

  private acceptInvitation(key: string) {
    if (!key) {
      console.error('No uid provided');
      this.router.navigate(['/']);
      return;
    }

    this.teamService.acceptInvitation(key).subscribe({
      next: () => {
        console.log('Invitation accepted successfully');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Failed to accept invitation:', error);
        this.router.navigate(['/']);
      }
    });
  }

  private registerUser(uid: string) {
    const currentUrl = window.location.href;
    this.keycloak.register({
      redirectUri: currentUrl
    });
  }
}
