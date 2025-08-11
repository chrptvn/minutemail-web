import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClipboardService } from '../../core/services/clipboard.service';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';

interface TeamMember {
  id: string;
  username: string;
  email: string;
  status: 'member' | 'invitation_sent';
  joinedAt?: string;
  invitedAt?: string;
}

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
    private readonly clipboardService: ClipboardService
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading.set(true);
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          username: 'john.doe',
          email: 'john.doe@company.com',
          status: 'member',
          joinedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          username: 'jane.smith',
          email: 'jane.smith@company.com',
          status: 'member',
          joinedAt: '2024-02-20T14:15:00Z'
        },
        {
          id: '3',
          username: 'bob.wilson',
          email: 'bob.wilson@company.com',
          status: 'invitation_sent',
          invitedAt: '2024-12-01T09:45:00Z'
        }
      ];
      
      this.members.set(mockMembers);
      this.loading.set(false);
    }, 1000);
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

    // Mock invitation - replace with actual API call
    setTimeout(() => {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        username: this.newMemberEmail.split('@')[0],
        email: this.newMemberEmail.trim(),
        status: 'invitation_sent',
        invitedAt: new Date().toISOString()
      };

      this.members.update(members => [...members, newMember]);
      this.newMemberEmail = '';
      this.inviting.set(false);
      this.showToastMessage('success', `Invitation sent to ${newMember.email}`);
    }, 1500);
  }

  removeMember(member: TeamMember) {
    const action = member.status === 'member' ? 'remove' : 'cancel invitation for';
    if (!confirm(`Are you sure you want to ${action} ${member.username}? This action cannot be undone.`)) {
      return;
    }

    this.removing.update(state => ({ ...state, [member.id]: true }));

    // Mock removal - replace with actual API call
    setTimeout(() => {
      this.members.update(members => members.filter(m => m.id !== member.id));
      this.removing.update(state => {
        const newState = { ...state };
        delete newState[member.id];
        return newState;
      });
      
      const actionText = member.status === 'member' ? 'removed' : 'invitation cancelled';
      this.showToastMessage('success', `${member.username} ${actionText} successfully`);
    }, 1000);
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
    return this.members().filter(m => m.status === 'member');
  }

  getPendingInvitations(): TeamMember[] {
    return this.members().filter(m => m.status === 'invitation_sent');
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