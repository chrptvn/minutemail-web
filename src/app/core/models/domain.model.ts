export interface Domain {
  name: string;
  verification: string;
  mx_valid: boolean;
  txt_valid: boolean;
}

export interface AddDomainRequest {
  name: string;
}

export interface DomainListResponse {
  domains?: Domain[];
}

export interface DeleteDomainResponse {
  message: string;
}
