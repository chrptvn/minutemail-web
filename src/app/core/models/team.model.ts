export interface TeamMember {
  id: string;
  username: string;
  email: string;
  status: 'member' | 'invitation_sent';
  joinedAt?: string;
  invitedAt?: string;
}

export interface InviteRequest {
  email: string;
}

export interface InviteResponse {
  email: string;
  status: string;
}