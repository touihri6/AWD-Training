import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { fakeAuth } from '../../testing/fake-auth';
import { Auth } from './auth';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: fakeAuth(['CANDIDATE'], 'abc.def.ghi') },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adds the bearer token to gateway calls', async () => {
    const response = firstValueFrom(http.get(`${environment.gatewayUrl}/mic2/jobs`));
    await Promise.resolve();

    const request = httpMock.expectOne(`${environment.gatewayUrl}/mic2/jobs`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    request.flush([]);
    await response;
  });

  it('does not send the token to other hosts', async () => {
    const response = firstValueFrom(http.get('https://example.com/data'));

    const request = httpMock.expectOne('https://example.com/data');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
    await response;
  });
});
