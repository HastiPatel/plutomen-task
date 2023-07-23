import { Component } from '@angular/core';
import { User } from './Models/models';
import { Router } from '@angular/router';
import { AuthService } from './Auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentUser: User;

  constructor(public router:Router,private authservice:AuthService,private spinner: NgxSpinnerService){
    this.spinner.show();
    this.authservice.currentUser.subscribe(x => this.currentUser = x);
    this.spinner.hide();
  }
}
