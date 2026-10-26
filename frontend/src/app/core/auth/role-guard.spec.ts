import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { fakeAuth } from '../../testing/fake-auth';
import { Auth, Role } from './auth';
import { roleGuard } from './role-guard';

function runGuard(userRoles: Role[], required: Role): boolean | UrlTree {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: Auth, useValue: fakeAuth(userRoles) }],
  });
  return TestBed.runInInjectionContext(
    () => roleGuard(required)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as boolean | UrlTree,
  );
}

describe('roleGuard', () => {
  it('lets a user with the role through', () => {
    expect(runGuard(['RECRUITER'], 'RECRUITER')).toBe(true);
  });

  it('redirects a user without the role to the job list', () => {
    const result = runGuard(['CANDIDATE'], 'RECRUITER');

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/jobs');
  });
});
