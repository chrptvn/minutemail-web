import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';
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
  private readonly keycloak = inject(Keycloak);

  ngOnInit() {
    // Get uid parameter from query string
    this.route.queryParams.subscribe(params => {
      const uid = params['uid'];
      
      // Log uid
      console.log('uid:', uid);
      
      // Check authentication status and log
      if (this.keycloak.authenticated) {
        console.log('connected');
      } else {
        console.log('not connected');
      }
    });
  }
}