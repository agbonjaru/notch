import { SharedModule } from "../shared/shared.module";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";

import { ProfilesRoutingModule } from "./profiles-routing.module";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { ProfileLayoutComponent } from "./profile-layout/profile-layout.component";
import { CompanyProfileComponent } from "./company-profile/company-profile.component";
import { ChangePwdComponent } from "./change-pwd/change-pwd.component";
import { CurrencyComponent } from "./company-profile/currency/currency.component";
import { ProfileGuards } from "./profile.guard";
import { LaddaModule } from "angular2-ladda";

@NgModule({
  declarations: [
    UserProfileComponent,
    ProfileLayoutComponent,
    CompanyProfileComponent,
    ChangePwdComponent,
    CurrencyComponent,
  ],
  imports: [
    CommonModule,
    ProfilesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    SelectDropDownModule,
    SharedModule,
    LaddaModule,
  ],
  providers: [...ProfileGuards],
})
export class ProfilesModule {}
