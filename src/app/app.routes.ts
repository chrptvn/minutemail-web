import { Routes } from '@angular/router';
import {canActivateAuthRole} from './core/gards/authgard';

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
    path: 'mailbox/:alias',
    loadComponent: () => import('./pages/inbox/inbox.component').then(m => m.InboxComponent),
    title: 'Inbox - MinuteMail'
  },
  {
    path: 'manage-domain',
    loadComponent: () => import('./pages/manage-domain/manage-domain.component').then(m => m.ManageDomainComponent),
    title: 'Manage Domain - MinuteMail',
    canActivate: [canActivateAuthRole],
    data: {
      role: 'owner'
    }
  },
  {
    path: 'mx-configuration',
    loadComponent: () => import('./pages/mx-configuration/mx-configuration.component').then(m => m.MxConfigurationComponent),
    title: 'MX Record Configuration - MinuteMail'
  },
  {
    path: 'api-keys',
    loadComponent: () => import('./pages/api-keys/api-keys.component').then(m => m.ApiKeysComponent),
    title: 'API Keys - MinuteMail',
    canActivate: [canActivateAuthRole],
    data: {
      role: 'member'
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
