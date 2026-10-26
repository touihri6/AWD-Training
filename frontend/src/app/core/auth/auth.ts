import { Injectable, computed, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

export type Role = 'CANDIDATE' | 'RECRUITER';

export interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
}

interface KeycloakClaims {
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  realm_access?: { roles?: string[] };
}

const KNOWN_ROLES: readonly Role[] = ['CANDIDATE', 'RECRUITER'];
const MIN_TOKEN_VALIDITY_SECONDS = 30;

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly keycloak = new Keycloak({ ...environment.keycloak });
  private readonly user = signal<UserProfile | null>(null);

  readonly profile = this.user.asReadonly();
  readonly isCandidate = computed(() => this.user()?.roles.includes('CANDIDATE') ?? false);
  readonly isRecruiter = computed(() => this.user()?.roles.includes('RECRUITER') ?? false);

  async init(): Promise<void> {
    await this.keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
    this.keycloak.onTokenExpired = () => {
      this.keycloak.updateToken(MIN_TOKEN_VALIDITY_SECONDS).catch(() => this.keycloak.login());
    };
    this.keycloak.onAuthRefreshSuccess = () => this.user.set(this.readProfile());
    this.user.set(this.readProfile());
  }

  hasRole(role: Role): boolean {
    return this.user()?.roles.includes(role) ?? false;
  }

  async token(): Promise<string> {
    await this.keycloak.updateToken(MIN_TOKEN_VALIDITY_SECONDS);
    return this.keycloak.token ?? '';
  }

  logout(): Promise<void> {
    return this.keycloak.logout({ redirectUri: window.location.origin });
  }

  private readProfile(): UserProfile | null {
    const claims = this.keycloak.tokenParsed as KeycloakClaims | undefined;
    if (!claims) {
      return null;
    }
    const roles = (claims.realm_access?.roles ?? []).filter((role): role is Role =>
      KNOWN_ROLES.includes(role as Role),
    );
    return {
      username: claims.preferred_username ?? '',
      firstName: claims.given_name ?? '',
      lastName: claims.family_name ?? '',
      email: claims.email ?? '',
      roles,
    };
  }
}
