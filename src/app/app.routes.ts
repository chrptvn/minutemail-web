import { Routes } from '@angular/router';
import {canActivateAuthRole, canActivateLogin} from './core/gards/authgard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'MinuteMail - Temporary Email Address'
  },
  {
    path: 'api',
    loadComponent: () => import('./pages/api/api.component').then(m => m.ApiComponent),
    title: 'API Documentation - MinuteMail'
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.component').then(m => m.PrivacyComponent),
    title: 'Privacy Policy - MinuteMail'
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.component').then(m => m.PricingComponent),
    title: 'Pricing - MinuteMail'
  },
  {
    path: 'plan-change',
    loadComponent: () => import('./pages/plan-change/plan-change.component').then(m => m.PlanChangeComponent),
    title: 'Change Plan - MinuteMail',
    canActivate: [canActivateLogin]
  },
  {
    path: 'subscribe',
    loadComponent: () => import('./pages/subscribe/subscribe.component').then(m => m.SubscribeComponent),
    title: 'Thanks for your confidence - MinuteMail',
    canActivate: [canActivateLogin]
  },
  {
    path: 'mailbox',
    loadComponent: () => import('./pages/inbox/inbox.component').then(m => m.InboxComponent),
    title: 'Mailbox - MinuteMail'
  },
  {
    path: 'manage-domain',
    loadComponent: () => import('./pages/manage-domain/manage-domain.component').then(m => m.ManageDomainComponent),
    title: 'Manage Domain - MinuteMail',
    canActivate: [canActivateAuthRole],
    data: {
      role: 'manage_domains'
    }
  },
  {
    path: 'custom-domains',
    loadComponent: () => import('./pages/mx-configuration/mx-configuration.component').then(m => m.MxConfigurationComponent),
    title: 'MX Record Configuration - MinuteMail'
  },
  {
    path: 'api-keys',
    loadComponent: () => import('./pages/api-keys/api-keys.component').then(m => m.ApiKeysComponent),
    title: 'API Keys - MinuteMail',
    canActivate: [canActivateAuthRole],
    data: {
      role: 'use_api'
    }
  },
  {
    path: 'members',
    loadComponent: () => import('./pages/members/members.component').then(m => m.MembersComponent),
    title: 'Team Members - MinuteMail',
    canActivate: [canActivateAuthRole],
    data: {
      role: 'invite'
    }
  },
  {
    path: 'invite',
    loadComponent: () => import('./pages/invite/invite.component').then(m => m.InviteComponent),
    title: 'Team Invitation - MinuteMail',
    canActivate: [canActivateLogin]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
