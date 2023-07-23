import { Inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, fromEvent, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take, tap, timeout } from 'rxjs/operators';
import { AuthService } from './Auth/auth.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');
export const apiWithoutHeader = [
];

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private onlineEvent: Observable<Event>;
  private offlineEvent: Observable<Event>;

  constructor(private injector: Injector,public authService:AuthService,private spinner:NgxSpinnerService,
              @Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number) {
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');
    this.onlineEvent.subscribe(e => {
      console.log('Application is Online');
      this.spinner.hide();
    });
    this.offlineEvent.subscribe(e => {
      console.log('Application is Offline');
      this.spinner.show();
    });
  }

  addToken(req: HttpRequest<any>): HttpRequest<any> {
    const accessToken = JSON.parse(localStorage.getItem('currentUser'));
    if (accessToken) {
      return req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
      });
    } else {
      return req;
    }
  }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const timeoutValue = request.headers.get('timeout') || this.defaultTimeout;
    const timeoutValueNumeric = Number(timeoutValue);

    if (this.apiWithNoHeaders(request)) {
      return next.handle(request).pipe(
        timeout(timeoutValueNumeric),
        tap((event: HttpResponse<any>) => {
          return event;
        }),
        catchError((error: HttpErrorResponse) => {
          return this.networkErrorScenario(error, request, next);
        })
      );
    } else {
      return next.handle(this.addToken(request)).pipe(
        timeout(timeoutValueNumeric),
        tap((response: HttpResponse<any>) => {
          if (response.type) {
            const token = response.headers.get('Authorization');
            if (token) {
              localStorage.setItem('currentUser', token.split(' ')[1]);
            }
          }
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          return this.networkErrorScenario(error, request, next);
        })
      );
    }
  }

  private networkErrorScenario(error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (error instanceof HttpErrorResponse) {
      const errorCode = (error as HttpErrorResponse).status;
      switch (true) {
        case (errorCode === 400):
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
          })
          return this.handle400Error(error);

        case (errorCode === 401):
          return this.handle401Error(request, next);

        case (errorCode >= 500 && errorCode < 600):
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
          })
          return throwError(error);

        case (errorCode === 0):
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
          })
          return throwError(error);

        default:
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error['error']['message'],
          })
          return throwError(error);
      }
    } else {
      return throwError(error);
    }
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.refreshTokenInProgress) {
      this.refreshTokenInProgress = true;
      this.refreshTokenSubject.next(null);

      return null;
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(req));
        })
      );
    }
  }

  handle400Error(error: HttpErrorResponse): Observable<HttpEvent<any>> {
    if (error && error.status === 400) {
      return throwError(error);
    }

    return throwError(error);
  }
  
  logoutUser(error: any): Observable<HttpEvent<any>> {
    return throwError(error);
  }

  apiWithNoHeaders(request: HttpRequest<object>): boolean {
    return apiWithoutHeader.includes(request.url);
  }
}