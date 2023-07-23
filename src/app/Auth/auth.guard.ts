import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { NgxSpinnerService } from "ngx-spinner";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthService,
    private spinner: NgxSpinnerService
) { }

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.spinner.show()
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser) {
        // logged in so return true
        this.spinner.hide();
        return true;
    }

    // not logged in so redirect to login page with the return url
    this.spinner.hide();
    this.router.navigate(['/login']);
    return false;
}
  
  
}
