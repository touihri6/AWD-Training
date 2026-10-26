import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, Job, JobRequest } from '../models';

export interface JobFilters {
  available?: boolean;
  categoryId?: number;
}

@Injectable({ providedIn: 'root' })
export class JobApi {
  private readonly http = inject(HttpClient);
  private readonly jobsUrl = `${environment.gatewayUrl}/mic2/jobs`;
  private readonly categoriesUrl = `${environment.gatewayUrl}/api/categories`;

  list(filters: JobFilters = {}): Observable<Job[]> {
    let params = new HttpParams();
    if (filters.available !== undefined) {
      params = params.set('available', filters.available);
    }
    if (filters.categoryId !== undefined) {
      params = params.set('categoryId', filters.categoryId);
    }
    return this.http.get<Job[]>(this.jobsUrl, { params });
  }

  create(request: JobRequest): Observable<Job> {
    return this.http.post<Job>(this.jobsUrl, request);
  }

  setAvailability(id: number, available: boolean): Observable<Job> {
    return this.http.patch<Job>(`${this.jobsUrl}/${id}/availability`, null, {
      params: new HttpParams().set('available', available),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.jobsUrl}/${id}`);
  }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }
}
