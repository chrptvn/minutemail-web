export interface Mail {
  id: string;
  from: string;
  subject: string;
  body: string;
  received_at: string;
  attachments?: string[];
}

export interface MailResponse {
  mails: Mail[];
  expireAt?: string;
}
