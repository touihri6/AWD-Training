import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth/auth';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(Auth);
  protected readonly displayName = computed(() => {
    const profile = this.auth.profile();
    if (!profile) {
      return '';
    }
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    return fullName || profile.username;
  });
  protected readonly roleLabel = computed(() => this.auth.profile()?.roles.join(' · ') ?? '');

  protected logout(): void {
    this.auth.logout();
  }
}
