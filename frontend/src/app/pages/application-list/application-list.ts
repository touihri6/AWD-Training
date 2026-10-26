import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ApplicationApi } from '../../core/api/application-api';
import { errorMessage } from '../../core/api/error-message';
import { Application } from '../../core/models';

@Component({
  selector: 'app-application-list',
  imports: [DatePipe],
  templateUrl: './application-list.html',
})
export class ApplicationList implements OnInit {
  private readonly applicationApi = inject(ApplicationApi);

  protected readonly applications = signal<Application[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly search = signal('');
  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (term === '') {
      return this.applications();
    }
    return this.applications().filter((application) =>
      [
        application.job?.name,
        application.candidate?.firstname,
        application.candidate?.lastname,
        application.candidate?.email,
      ].some((value) => value?.toLowerCase().includes(term)),
    );
  });

  async ngOnInit(): Promise<void> {
    try {
      const applications = await firstValueFrom(this.applicationApi.list());
      this.applications.set([...applications].sort((a, b) => b.id - a.id));
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }
}
