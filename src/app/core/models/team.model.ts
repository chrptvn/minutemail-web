export interface TeamMember {
  email: string;
  status: 'PENDING' | 'ACTIVE';
}

export interface InviteRequest {
  email: string;
}

export interface InviteResponse {
  email: string;
  status: 'PENDING';
}