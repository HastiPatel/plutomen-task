import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagesService {

  constructor(private http: HttpClient) { }

  public baseUrl:string=environment.baseUrl;

  getLibraries(page,perPage):Observable<any>{
    return this.http.get(this.baseUrl+ "/backend/libraries/page=" + page + "/perPage="+ perPage)
    .pipe(catchError((err) => { return throwError(err); }))
  }
}
