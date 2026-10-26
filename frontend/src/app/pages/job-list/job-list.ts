import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ApplicationApi } from '../../core/api/application-api';
import { errorMessage } from '../../core/api/error-message';
import { JobApi } from '../../core/api/job-api';
import { Auth } from '../../core/auth/auth';
import { CandidateProfile } from '../../core/candidate-profile';
import { Category, Job } from '../../core/models';

@Component({
  selector: 'app-job-list',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './job-list.html',
  styleUrl: './job-list.css',
})
export class JobList implements OnInit {
  private readonly jobApi = inject(JobApi);
  private readonly applicationApi = inject(ApplicationApi);
  private readonly candidateProfile = inject(CandidateProfile);
  protected readonly auth = inject(Auth);

  protected readonly jobs = signal<Job[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly openOnly = signal(!this.auth.isRecruiter());
  protected readonly categoryId = signal<number | null>(null);
  protected readonly applyingTo = signal<number | null>(null);
  protected readonly busy = signal(false);
  protected readonly candidate = this.candidateProfile.candidate;
  protected readonly needsProfile = computed(() => this.auth.isCandidate() && this.candidate() === null);

  protected readonly motivation = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(1000)],
  });

  async ngOnInit(): Promise<void> {
    if (this.auth.isCandidate()) {
      this.candidateProfile.load().catch((err) => this.error.set(errorMessage(err)));
    }
    this.jobApi.categories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
    await this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const jobs = await firstValueFrom(
        this.jobApi.list({
          available: this.openOnly() ? true : undefined,
          categoryId: this.categoryId() ?? undefined,
        }),
      );
      this.jobs.set(jobs);
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected setOpenOnly(value: boolean): void {
    this.openOnly.set(value);
    this.load();
  }

  protected setCategory(value: string): void {
    this.categoryId.set(value === '' ? null : Number(value));
    this.load();
  }

  protected startApplying(job: Job): void {
    this.notice.set(null);
    this.error.set(null);
    this.motivation.reset();
    this.applyingTo.set(job.id);
  }

  protected cancelApplying(): void {
    this.applyingTo.set(null);
  }

  protected async apply(job: Job): Promise<void> {
    const candidate = this.candidate();
    if (!candidate || this.motivation.invalid) {
      this.motivation.markAsTouched();
      return;
    }
    await this.run(async () => {
      await firstValueFrom(
        this.applicationApi.apply({
          candidateId: candidate.id,
          jobId: job.id,
          motivation: this.motivation.value.trim(),
        }),
      );
      this.applyingTo.set(null);
      this.notice.set(`Your application for "${job.name}" has been sent. A confirmation e-mail is on its way.`);
    });
  }

  protected async toggleAvailability(job: Job): Promise<void> {
    await this.run(async () => {
      await firstValueFrom(this.jobApi.setAvailability(job.id, !job.available));
      this.notice.set(`"${job.name}" is now ${job.available ? 'closed' : 'open'}.`);
      await this.load();
    });
  }

  protected async remove(job: Job): Promise<void> {
    if (!confirm(`Delete the job "${job.name}"?`)) {
      return;
    }
    await this.run(async () => {
      await firstValueFrom(this.jobApi.delete(job.id));
      this.notice.set(`"${job.name}" has been deleted.`);
      await this.load();
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      await action();
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}
