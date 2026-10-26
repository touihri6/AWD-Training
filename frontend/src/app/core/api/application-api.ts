import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application, ApplicationRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ApplicationApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.gatewayUrl}/mic3/candidature`;

  list(): Observable<Application[]> {
    return this.http.get<Application[]>(this.url);
  }

  apply(request: ApplicationRequest): Observable<Application> {
    return this.http.post<Application>(this.url, request);
  }

  withdraw(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
