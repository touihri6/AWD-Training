import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { errorMessage } from '../../core/api/error-message';
import { JobApi } from '../../core/api/job-api';
import { Category } from '../../core/models';

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

@Component({
  selector: 'app-job-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './job-form.html',
})
export class JobForm implements OnInit {
  private readonly jobApi = inject(JobApi);
  private readonly router = inject(Router);

  protected readonly categories = signal<Category[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(1000)],
    date: [today(), Validators.required],
    available: [true],
    categoryId: [0, Validators.min(1)],
  });

  async ngOnInit(): Promise<void> {
    try {
      this.categories.set(await firstValueFrom(this.jobApi.categories()));
    } catch (err) {
      this.error.set(errorMessage(err));
    }
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.jobApi.create({
          name: value.name.trim(),
          description: value.description.trim() || null,
          date: value.date,
          available: value.available,
          categoryId: Number(value.categoryId),
        }),
      );
      await this.router.navigate(['/jobs']);
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
