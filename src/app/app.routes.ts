import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'MinuteMail - Temporary Email Address'
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
