export interface Domain {
  name: string;
  mailbox_ttl: number;
  verification: string;
  mx_valid: boolean;
  txt_valid: boolean;
}

export interface AddDomainRequest {
  name: string;
  mailbox_ttl: number;
}

export interface DomainListResponse {
  domains?: Domain[];
}

export interface DeleteDomainResponse {
  message: string;
}