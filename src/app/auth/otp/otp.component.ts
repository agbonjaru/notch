import { AuthService } from './../auth.service';
import { Router } from '@angular/router';
import { SignupLoginService } from './../../services/signupLogin.service';
import { NgModel } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent implements OnInit {
  username;
  loading = false;
  loginStatus = {error: {status: false, msg: 'Sorry error occured try again'}}
  constructor(
    private signUpSrv: SignupLoginService,
    private router: Router,
    private authSrv: AuthService) {
    signUpSrv.otpInfo.subscribe(data => {
      if(data) {
        this.username = data;
        console.log(this.username);
      } else {
        this.router.navigate(['/login'])
      }
    })
   }

  ngOnInit() {
  }

  verifyOtp(val: NgModel) {
    if(val.valid) {
      this.loginStatus.error.status = false;
      this.loading = true;
      const body = {username: this.username, optVal: val.value}
      this.signUpSrv.verifyOTP(body).subscribe(res => {
        // this.loading = false;
        this.authSrv.storeUser(res);
        this.router.navigate(['/dashboard']);
      }, err => {
        this.loading = false;
        this.loginStatus.error.status = true;
        let errMsg = 'Sorry error occured try again';
        errMsg = err && err.error && err.error.message ? err.error.message : errMsg;
        this.loginStatus.error.msg = errMsg;
      })
    }
  }

}
