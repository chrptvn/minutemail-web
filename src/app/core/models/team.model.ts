export interface TeamMember {
  user_id: string;
  email: string;
  status: 'PENDING' | 'ACTIVE' | 'CURRENT_USER';
}

export interface InviteRequest {
  email: string;
}

export interface InviteResponse {
  user_id: string;
  email: string;
  status: 'PENDING';
}