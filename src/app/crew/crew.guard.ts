import { Injectable } from '@angular/core';
import { CanActivate, Router, CanLoad } from '@angular/router';
import { GeneralService } from '../services/general.service';

@Injectable()
export class TeamsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('TEAMS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class SalesPersonGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('SALESPERSON')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class GamificatoinGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('GAMIFICATION')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class CrewModuleGuard implements CanLoad {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canLoad() {    
    if(this.gs.canAccessModule('TEAMS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
export const CrewGuard = [ TeamsGuard, SalesPersonGuard, GamificatoinGuard]