import { Injectable } from '@angular/core';
import { CanActivate, Router, CanLoad } from '@angular/router';
import { GeneralService } from '../services/general.service';


@Injectable()
export class PeriodsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('PERIOD')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class CompanyTargetsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('COMPANY_TARGETS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class AssignedTargetsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('ASSIGNED_TARGET')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class CommissionProfilesGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('COMMISSION_PROFILES')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class CommissionGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('COMMISSIONS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class TargetModuleGuard implements CanLoad {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canLoad() {    
    if(this.gs.canAccessModule('TARGETS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
export const TargetsGuard = [ PeriodsGuard, CompanyTargetsGuard, AssignedTargetsGuard, CommissionProfilesGuard, CommissionGuard]