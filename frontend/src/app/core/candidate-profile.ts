import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CandidateApi } from './api/candidate-api';
import { Auth } from './auth/auth';
import { Candidate, CandidateRequest } from './models';

@Injectable({ providedIn: 'root' })
export class CandidateProfile {
  private readonly api = inject(CandidateApi);
  private readonly auth = inject(Auth);
  private readonly state = signal<Candidate | null | undefined>(undefined);

  readonly candidate = this.state.asReadonly();

  async load(): Promise<Candidate | null> {
    const current = this.state();
    return current === undefined ? this.refresh() : current;
  }

  async refresh(): Promise<Candidate | null> {
    const email = this.auth.profile()?.email.toLowerCase() ?? '';
    const candidates = await firstValueFrom(this.api.list());
    const mine = candidates.find((candidate) => candidate.email.toLowerCase() === email) ?? null;
    this.state.set(mine);
    return mine;
  }

  async create(request: CandidateRequest): Promise<Candidate> {
    const created = await firstValueFrom(this.api.create(request));
    this.state.set(created);
    return created;
  }
}
