import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'jobs' },
  {
    path: 'jobs',
    title: 'Jobs · JobBoard',
    loadComponent: () => import('./pages/job-list/job-list').then((m) => m.JobList),
  },
  {
    path: 'jobs/new',
    title: 'New job · JobBoard',
    canActivate: [roleGuard('RECRUITER')],
    loadComponent: () => import('./pages/job-form/job-form').then((m) => m.JobForm),
  },
  {
    path: 'applications',
    title: 'Applications · JobBoard',
    canActivate: [roleGuard('RECRUITER')],
    loadComponent: () => import('./pages/application-list/application-list').then((m) => m.ApplicationList),
  },
  {
    path: 'profile',
    title: 'My profile · JobBoard',
    canActivate: [roleGuard('CANDIDATE')],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'my-applications',
    title: 'My applications · JobBoard',
    canActivate: [roleGuard('CANDIDATE')],
    loadComponent: () => import('./pages/my-applications/my-applications').then((m) => m.MyApplications),
  },
  { path: '**', redirectTo: 'jobs' },
];
