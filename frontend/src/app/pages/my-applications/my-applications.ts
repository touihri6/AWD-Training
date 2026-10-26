import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApplicationApi } from '../../core/api/application-api';
import { errorMessage } from '../../core/api/error-message';
import { CandidateProfile } from '../../core/candidate-profile';
import { Application } from '../../core/models';

@Component({
  selector: 'app-my-applications',
  imports: [DatePipe, RouterLink],
  templateUrl: './my-applications.html',
})
export class MyApplications implements OnInit {
  private readonly applicationApi = inject(ApplicationApi);
  private readonly candidateProfile = inject(CandidateProfile);

  protected readonly candidate = this.candidateProfile.candidate;
  protected readonly applications = signal<Application[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const me = await this.candidateProfile.load();
      if (!me) {
        this.applications.set([]);
        return;
      }
      const all = await firstValueFrom(this.applicationApi.list());
      this.applications.set(all.filter((application) => application.candidate?.id === me.id));
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async withdraw(application: Application): Promise<void> {
    if (!confirm(`Withdraw your application for "${application.job.name}"?`)) {
      return;
    }
    this.error.set(null);
    this.notice.set(null);
    try {
      await firstValueFrom(this.applicationApi.withdraw(application.id));
      this.notice.set(`Your application for "${application.job.name}" has been withdrawn.`);
      await this.load();
    } catch (err) {
      this.error.set(errorMessage(err));
    }
  }
}
