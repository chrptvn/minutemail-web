export interface ApiKey {
  apiKey: string;
  name: string;
  hosts: string[];
  createdAt: string;
  expireAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  ttl: number;
  hosts: string[];
}

export interface DeleteApiKeyResponse {
  message: string;
}
