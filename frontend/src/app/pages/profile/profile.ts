import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api/error-message';
import { Auth } from '../../core/auth/auth';
import { CandidateProfile } from '../../core/candidate-profile';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private readonly auth = inject(Auth);
  private readonly candidateProfile = inject(CandidateProfile);

  protected readonly candidate = this.candidateProfile.candidate;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly email = this.auth.profile()?.email ?? '';

  protected readonly form = inject(FormBuilder).nonNullable.group({
    firstname: [this.auth.profile()?.firstName ?? '', [Validators.required, Validators.maxLength(100)]],
    lastname: [this.auth.profile()?.lastName ?? '', [Validators.required, Validators.maxLength(100)]],
    street: [''],
    houseNumber: [''],
    zipCode: [''],
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.candidateProfile.refresh();
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async create(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const hasAddress = [value.street, value.houseNumber, value.zipCode].some((part) => part.trim() !== '');
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.candidateProfile.create({
        firstname: value.firstname.trim(),
        lastname: value.lastname.trim(),
        email: this.email,
        address: hasAddress
          ? {
              street: value.street.trim() || null,
              houseNumber: value.houseNumber.trim() || null,
              zipCode: value.zipCode.trim() || null,
            }
          : null,
      });
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
