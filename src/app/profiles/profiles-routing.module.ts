import { ChangePwdComponent } from './change-pwd/change-pwd.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileLayoutComponent } from './profile-layout/profile-layout.component';
import { CompanyProfileGuard } from './profile.guard';

const routes: Routes = [
  { path: '',
    component: ProfileLayoutComponent,
    children: [
      {
        path: 'user',
        component: UserProfileComponent
      },
      {
        path: 'company',
        component: CompanyProfileComponent,
        canActivate: [ CompanyProfileGuard]
      },
      {
        path: 'change-pwd',
        component: ChangePwdComponent
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfilesRoutingModule { }
