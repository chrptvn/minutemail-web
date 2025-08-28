export interface Subscription {
  plan: string;
  interval: string;
}

export interface SubscriptionResponse {
  message: string;
  checkout_url?: string;
}
