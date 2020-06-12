import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { GeneralService } from '../services/general.service'


@Injectable()
export class CompanyProfileGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('COMPANY_PROFILE')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
export const ProfileGuards = [ CompanyProfileGuard]