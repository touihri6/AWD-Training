import { computed, signal } from '@angular/core';
import { Auth, Role, UserProfile } from '../core/auth/auth';

export function fakeAuth(roles: Role[], token = 'test-token'): Partial<Auth> {
  const profile = signal<UserProfile | null>({
    username: 'lina',
    firstName: 'Lina',
    lastName: 'Mansour',
    email: 'lina.mansour@example.com',
    roles,
  });
  return {
    profile: profile.asReadonly(),
    isCandidate: computed(() => roles.includes('CANDIDATE')),
    isRecruiter: computed(() => roles.includes('RECRUITER')),
    hasRole: (role: Role) => roles.includes(role),
    token: async () => token,
    logout: async () => undefined,
  };
}
