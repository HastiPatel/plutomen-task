import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import  { AuthService } from './../auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,public router:Router,private authservice:AuthService,private spinner: NgxSpinnerService) {
    if (this.authservice.currentUserValue) { 
      this.router.navigate(['dashboard']);
    }
   }

  logInForm: FormGroup;

  ngOnInit(): void {
    this.logInForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.logInForm.valid) {
      this.spinner.show();
      this.authservice.login(this.logInForm.value['email'],this.logInForm.value['password']).subscribe(
        data => {
          this.spinner.hide();
          if(data['status']=="Active")
          {
            Swal.fire({
              icon: 'success',
              text: 'Logged-in Successfully',
            })
            this.router.navigate(['dashboard'])
          }else{
            debugger;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: data['message'],
            })
          }
        },
        error => {
          this.spinner.hide();
        });
    }
  }

  redirectToPage(pageUrl:string){
    this.router.navigate([pageUrl]);
  }
}
