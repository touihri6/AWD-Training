import { HttpErrorResponse } from '@angular/common/http';
import { errorMessage } from './error-message';

describe('errorMessage', () => {
  it('uses the RFC 7807 detail sent by candidat and job', () => {
    const error = new HttpErrorResponse({ status: 409, error: { title: 'Conflict', detail: 'Email already used' } });

    expect(errorMessage(error)).toBe('Email already used');
  });

  it('uses the message sent by candidature', () => {
    const error = new HttpErrorResponse({ status: 409, error: { message: 'Ce candidat a déjà postulé à ce job' } });

    expect(errorMessage(error)).toBe('Ce candidat a déjà postulé à ce job');
  });

  it('explains a gateway that cannot be reached', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('unreachable');
  });

  it('explains a forbidden action', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 403 }))).toBe('You are not allowed to do this.');
  });

  it('handles errors that are not HTTP errors', () => {
    expect(errorMessage(new Error('boom'))).toBe('Unexpected error.');
  });
});
