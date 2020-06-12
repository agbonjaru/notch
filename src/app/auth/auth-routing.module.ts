import { CompleteSignupComponent } from "./signup/complete-signup/complete-signup.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { OtpComponent } from "./otp/otp.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";

const authRoutes: Routes = [
  { path: "otp", component: OtpComponent },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "complete-signup/:id", component: CompleteSignupComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "reset-password/:token", component: ResetPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
