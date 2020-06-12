import { Injectable } from '@angular/core';
import { CanActivate, Router, CanLoad } from '@angular/router';
import { GeneralService } from '../services/general.service';


@Injectable()
export class LeadsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('LEADS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('COMPANIES')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class ContactsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('CONTACTS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class ClientModuleGuard implements CanLoad {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canLoad() {    
    if(this.gs.canAccessModule('CLIENTS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
export const ClientsGuard = [ LeadsGuard, CompanyGuard, ContactsGuard]