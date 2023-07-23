import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from '../Models/models';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  public baseUrl:string=environment.baseUrl;

  constructor(private http: HttpClient) {
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
      this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
      return this.currentUserSubject.value;
  }

  getHeaders() {
    const token = JSON.parse(localStorage.getItem('currentUser'));
    return token ? new HttpHeaders().set('Authorization', "Bearer " + token) : null;
  }

  login(email: string, password: string) {
      let user={
        "email":email,
        "password":password,
        "deviceType":"web"
      }
      return this.http.post<any>(this.baseUrl+'/backend/account/login',user)
          .pipe(map(user => {
            debugger;
              // store user details and jwt token in local storage to keep user logged in between page refreshes
              localStorage.setItem('currentUser', JSON.stringify(user['accessToken']));
              this.currentUserSubject.next(user);
              return user;
          }));
  }


  logout() {
      // remove user from local storage to log user out
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
  }
}
