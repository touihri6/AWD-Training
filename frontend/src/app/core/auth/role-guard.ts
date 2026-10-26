import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, Role } from './auth';

export function roleGuard(role: Role): CanActivateFn {
  return () => inject(Auth).hasRole(role) || inject(Router).createUrlTree(['/jobs']);
}
