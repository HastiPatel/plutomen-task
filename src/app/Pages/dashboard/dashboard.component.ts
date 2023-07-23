import { Component, OnInit } from '@angular/core';
import { PagesService } from './../pages.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  LibraryData:any;
  constructor(private pagesService:PagesService,private spinner:NgxSpinnerService) { }

  ngOnInit(): void {
    this.intializeData();
  }

  intializeData(){
    this.spinner.show();
    this.pagesService.getLibraries(1,10).subscribe(res=>{
      console.log(res['docs']);
      this.LibraryData = res['docs'];
      this.spinner.hide();
    },(error)=>{
      this.spinner.hide();
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      })
    })
  }

}
