import { Routes } from '@angular/router';

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
    path: ':alias',
    loadComponent: () => import('./pages/inbox/inbox.component').then(m => m.InboxComponent),
    title: 'Inbox - MinuteMail'
  },
  {
    path: '**',
    redirectTo: ''
  }
];