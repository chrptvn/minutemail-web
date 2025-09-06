import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClipboardService } from '../../core/services/clipboard.service';
import { TeamService } from '../../core/services/team.service';
import {TeamMember, InviteRequest, Team} from '../../core/models/team.model';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { TablerIconComponent } from '../../shared/components/icons/tabler-icons.component';
import { ToastComponent } from '../../shared/components/ui/toast.component';
import { SpinnerComponent } from '../../shared/components/ui/spinner.component';
import { TopMenu } from '../../shared/components/top-menu/top-menu';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';

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
    FooterComponent,
    ModalComponent
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent implements OnInit {
  members = signal<TeamMember[]>([]);
  team = signal<Team | null>(null);
  loading = signal(false);
  inviting = signal(false);
  removing = signal<{ [key: string]: boolean }>({});
  copying = signal<{ [key: string]: boolean }>({});
  copied = signal<{ [key: string]: boolean }>({});

  // Slots modal state
  showSlotsModal = signal(false);
  targetSlots = signal(5);

  newMemberEmail = '';
  invitationLink = '';

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
    // Initialize target slots with current max_members
    const teamData = this.team();
    if (teamData?.max_members) {
      this.targetSlots.set(teamData.max_members);
    }
  }

  loadMembers() {
    this.loading.set(true);

    this.teamService.getTeam().subscribe({
      next: (team) => {
        this.team.set(team);
        this.members.set(team.members || []);
        // Update target slots when team data loads
        if (team.max_members) {
          this.targetSlots.set(team.max_members);
        }
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

    // Check if at member limit
    if (this.isAtMemberLimit()) {
      this.showToastMessage('error', 'You have reached the maximum number of team members for your current plan');
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
        // Update team current_members count
        this.team.update(team => team ? { ...team, current_members: team.current_members + 1 } : null);
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

    this.removing.update(state => ({ ...state, [member.user_id]: true }));

    this.teamService.removeMember(member.user_id).subscribe({
      next: () => {
        this.members.update(members => members.filter(m => m.user_id !== member.user_id));
        // Update team current_members count
        this.team.update(team => team ? { ...team, current_members: team.current_members - 1 } : null);
        this.removing.update(state => {
          const newState = { ...state };
          delete newState[member.user_id];
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
          delete newState[member.user_id];
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
    return this.members().filter(m => m.status === 'ACTIVE' || m.status === 'CURRENT_USER');
  }

  getPendingInvitations(): TeamMember[] {
    return this.members().filter(m => m.status === 'PENDING');
  }

  isAtMemberLimit(): boolean {
    const teamData = this.team();
    if (!teamData || !teamData.max_members) {
      return false; // No limit if max_members is not set
    }
    return teamData.current_members >= teamData.max_members;
  }

  getRemainingSlots(): number {
    const teamData = this.team();
    if (!teamData || !teamData.max_members) {
      return 999; // Show unlimited if no limit
    }
    return Math.max(0, teamData.max_members - teamData.current_members);
  }

  getMemberLimitCardClass(): string {
    const baseClasses = "rounded-lg p-4 border";
    
    if (this.isAtMemberLimit()) {
      return `${baseClasses} bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800`;
    } else if (this.getRemainingSlots() <= 2) {
      return `${baseClasses} bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800`;
    } else {
      return `${baseClasses} bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800`;
    }
  }

  getMemberLimitIconClass(): string {
    if (this.isAtMemberLimit()) {
      return "w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center";
    } else if (this.getRemainingSlots() <= 2) {
      return "w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center";
    } else {
      return "w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center";
    }
  }

  getMemberLimitIcon(): string {
    if (this.isAtMemberLimit()) {
      return "alert-triangle";
    } else if (this.getRemainingSlots() <= 2) {
      return "alert-triangle";
    } else {
      return "check-circle";
    }
  }

  openSlotsModal() {
    // Reset target slots to current value
    const teamData = this.team();
    if (teamData?.max_members) {
      this.targetSlots.set(teamData.max_members);
    }
    this.showSlotsModal.set(true);
  }

  closeSlotsModal() {
    this.showSlotsModal.set(false);
  }

  incrementSlots() {
    if (this.targetSlots() < 50) {
      this.targetSlots.update(current => current + 1);
    }
  }

  decrementSlots() {
    if (this.targetSlots() > 5) {
      this.targetSlots.update(current => current - 1);
    }
  }

  getAdditionalSlots(): number {
    return Math.max(0, this.targetSlots() - 5);
  }

  getTotalPrice(): number {
    return 50 + (this.getAdditionalSlots() * 5);
  }

  hasChanges(): boolean {
    const teamData = this.team();
    return teamData?.max_members !== this.targetSlots();
  }

  isIncreasing(): boolean {
    const teamData = this.team();
    return this.targetSlots() > (teamData?.max_members || 5);
  }

  getChangeTitle(): string {
    return this.isIncreasing() ? 'Increase Team Slots' : 'Decrease Team Slots';
  }

  getChangeDescription(): string {
    const teamData = this.team();
    const currentSlots = teamData?.max_members || 5;
    const difference = Math.abs(this.targetSlots() - currentSlots);
    
    if (this.isIncreasing()) {
      return `Adding ${difference} slot${difference === 1 ? '' : 's'} will cost an additional $${difference * 5}/month.`;
    } else {
      return `Removing ${difference} slot${difference === 1 ? '' : 's'} will save $${difference * 5}/month.`;
    }
  }

  getChangeIcon(): string {
    return this.isIncreasing() ? 'arrow-up' : 'arrow-down';
  }

  getChangeIconClass(): string {
    return this.isIncreasing() 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-blue-600 dark:text-blue-400';
  }

  getChangeSummaryClass(): string {
    const baseClasses = 'p-4 rounded-lg border';
    
    if (this.isIncreasing()) {
      return `${baseClasses} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200`;
    } else {
      return `${baseClasses} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200`;
    }
  }

  getConfirmButtonText(): string {
    return this.isIncreasing() ? 'Add Slots' : 'Remove Slots';
  }

  confirmSlotChange() {
    if (!this.hasChanges()) {
      return;
    }

    // Navigate to plan change page with slot information
    this.router.navigate(['/plan-change'], {
      queryParams: { 
        plan: 'team',
        interval: 'monthly',
        slots: this.targetSlots()
      }
    });
    
    this.closeSlotsModal();
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
