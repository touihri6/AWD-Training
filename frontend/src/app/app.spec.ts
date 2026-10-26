import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { Auth, Role } from './core/auth/auth';
import { fakeAuth } from './testing/fake-auth';

async function render(roles: Role[]): Promise<HTMLElement> {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [provideRouter([]), { provide: Auth, useValue: fakeAuth(roles) }],
  }).compileComponents();
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

function navLabels(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll('nav a')).map((link) => link.textContent?.trim() ?? '');
}

describe('App', () => {
  it('shows the candidate navigation and the user name', async () => {
    const root = await render(['CANDIDATE']);

    expect(navLabels(root)).toEqual(['Jobs', 'My applications', 'My profile']);
    expect(root.querySelector('.user-name')?.textContent).toContain('Lina Mansour');
    expect(root.querySelector('.role')?.textContent).toContain('CANDIDATE');
  });

  it('shows the recruiter navigation', async () => {
    const root = await render(['RECRUITER']);

    expect(navLabels(root)).toEqual(['Jobs', 'New job', 'Applications']);
  });
});
