export interface ApiKey {
  id: string;
  name: string;
  key: string;
  hosts: string[];
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface CreateApiKeyRequest {
  name: string;
  ttl: number;
  hosts: string[];
}

export interface CreateApiKeyResponse {
  message: string;
  apiKey: ApiKey;
}

export interface DeleteApiKeyResponse {
  message: string;
}