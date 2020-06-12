import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from './auth-routing.module';
import { SignupComponent } from './signup/signup.component';
import { OtpComponent } from './otp/otp.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LaddaModule } from 'angular2-ladda';
import { CompleteSignupComponent } from './signup/complete-signup/complete-signup.component';
import { NgOtpInputModule } from 'ng-otp-input';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LaddaModule,
    SharedModule,
    NgOtpInputModule,
    AuthRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginComponent,
    SignupComponent,
    OtpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    CompleteSignupComponent
  ],
})

export class AuthModule { }
