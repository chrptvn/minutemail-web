export interface ApiKey {
  api_key: string;
  name: string;
  hosts: string[];
  created_at: string;
  expire_at: string;
}

export interface CreateApiKeyRequest {
  name: string;
  ttl: number;
  hosts: string[];
}

export interface DeleteApiKeyResponse {
  message: string;
}
