import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClipboardService } from '../../core/services/clipboard.service';
import { TeamService } from '../../core/services/team.service';
import { TeamMember, InviteRequest } from '../../core/models/team.model';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TablerIconComponent,
    ToastComponent,
    SpinnerComponent,
    TopMenu,
    FooterComponent
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent implements OnInit {
  members = signal<TeamMember[]>([]);
  loading = signal(false);
  inviting = signal(false);
  removing = signal<{ [key: string]: boolean }>({});
  copying = signal<{ [key: string]: boolean }>({});
  copied = signal<{ [key: string]: boolean }>({});

  newMemberEmail = '';
  invitationLink = 'https://minutemail.co/invite/abc123def456ghi789';

  // Toast notifications
  showToast = signal(false);
  toastType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage = signal('');

  constructor(
    private readonly router: Router,
    private readonly clipboardService: ClipboardService,
    private readonly teamService: TeamService
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading.set(true);
    
    this.teamService.getTeamMembers().subscribe({
      next: (members) => {
        this.members.set(members || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.showToastMessage('error', error.message);
        this.loading.set(false);
      }
    });
  }

  sendInvitation() {
    if (!this.newMemberEmail.trim()) {
      this.showToastMessage('error', 'Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (this.members().some(m => m.email.toLowerCase() === this.newMemberEmail.toLowerCase())) {
      this.showToastMessage('error', 'This email is already a team member or has a pending invitation');
      return;
    }

    this.inviting.set(true);


    const request: InviteRequest = {
      email: this.newMemberEmail.trim()
    };

    this.teamService.sendInvitation(request).subscribe({
      next: (response) => {
        // Add the new member to the list
        this.members.update(members => [...members, response]);
        this.newMemberEmail = '';
        this.inviting.set(false);
        this.showToastMessage('success', `Invitation sent to ${response.email}`);
      },
      error: (error) => {
        console.error('Error sending invitation:', error);
        this.showToastMessage('error', error.message);
        this.inviting.set(false);
      }
    });
  }

  removeMember(member: TeamMember) {
    const action = member.status === 'ACTIVE' ? 'remove' : 'cancel invitation for';
    const displayName = this.getDisplayName(member);
    if (!confirm(`Are you sure you want to ${action} ${displayName}? This action cannot be undone.`)) {
      return;
    }

    this.removing.update(state => ({ ...state, [member.email]: true }));

    this.teamService.removeMember(member.email).subscribe({
      next: () => {
        this.members.update(members => members.filter(m => m.email !== member.email));
        this.removing.update(state => {
          const newState = { ...state };
          delete newState[member.email];
          return newState;
        });
        
        const actionText = member.status === 'ACTIVE' ? 'removed' : 'invitation cancelled';
        this.showToastMessage('success', `${displayName} ${actionText} successfully`);
      },
      error: (error) => {
        console.error('Error removing member:', error);
        this.showToastMessage('error', error.message);
        this.removing.update(state => {
          const newState = { ...state };
          delete newState[member.email];
          return newState;
        });
      }
    });
  }

  async copyInvitationLink() {
    this.copying.update(state => ({ ...state, ['invitation']: true }));

    try {
      const success = await this.clipboardService.copyToClipboard(this.invitationLink);

      if (success) {
        this.copied.update(state => ({ ...state, ['invitation']: true }));
        this.showToastMessage('success', 'Invitation link copied to clipboard!');

        // Reset copied state after 2 seconds
        setTimeout(() => {
          this.copied.update(state => ({ ...state, ['invitation']: false }));
        }, 2000);
      } else {
        this.showToastMessage('error', 'Failed to copy to clipboard');
      }
    } finally {
      this.copying.update(state => ({ ...state, ['invitation']: false }));
    }
  }

  getDisplayName(member: TeamMember): string {
    return member.email.split('@')[0];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  getActiveMembers(): TeamMember[] {
    return this.members().filter(m => m.status === 'ACTIVE');
  }

  getPendingInvitations(): TeamMember[] {
    return this.members().filter(m => m.status === 'PENDING');
  }

  private showToastMessage(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    this.toastType.set(type);
    this.toastMessage.set(message);
    this.showToast.set(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  hideToast() {
    this.showToast.set(false);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}