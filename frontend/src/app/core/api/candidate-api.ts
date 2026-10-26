import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Candidate, CandidateRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class CandidateApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.gatewayUrl}/mic1/candidates`;

  list(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.url);
  }

  create(request: CandidateRequest): Observable<Candidate> {
    return this.http.post<Candidate>(this.url, request);
  }
}
