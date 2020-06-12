import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserRegistrationComponent } from "./user-registration/user-registration.component";
import { RegRoutingModule } from "./reg-routing.module";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { LoginComponent } from "./login/login.component";
import { OrgRegistrationComponent } from "./org-registration/org-registration.component";
import { LicenseComponent } from "./license/license.component";
import { StandaloneSignupService } from "./services/standalone-signup.service";
import { ErrorInterceptor } from "../helpers/error.interceptor.service";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { BillingService } from "./services/billing.service";
import {
  MatSlideToggleModule,
  MatProgressSpinnerModule,
} from "@angular/material";
import { SharedModule } from "../shared/shared.module";
import { ValidateUserComponent } from './validateUser.component';
import { DirectiveModule } from '../shared/directives/directive.module';

@NgModule({
  declarations: [
    UserRegistrationComponent,
    LoginComponent,
    OrgRegistrationComponent,
    LicenseComponent,
    ValidateUserComponent
  ],
  imports: [
    CommonModule,
    RegRoutingModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    FormsModule,
    SharedModule,
    DirectiveModule
  ],
  providers: [
    StandaloneSignupService,
    BillingService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
})
export class RegistrationModule {}
