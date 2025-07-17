export interface Domain {
  domain: string;
}

export interface DomainVerificationResponse {
  valid: boolean;
}

export interface DomainListResponse {
  domains: Domain[];
}

export interface AddDomainRequest {
  domain: string;
}

export interface DeleteDomainResponse {
  message: string;
}