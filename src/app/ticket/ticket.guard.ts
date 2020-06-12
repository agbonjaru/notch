import { Injectable } from '@angular/core';
import { CanActivate, Router, CanLoad } from '@angular/router';
import { GeneralService } from '../services/general.service';

@Injectable()
export class TicketDashboardGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('TICKETS_DASHBOARD')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
} 
@Injectable()
export class AllTicketGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('ALL_TICKETS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}

@Injectable()
export class TicketReportGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('TICKETS_REPORTS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class AgentsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('AGENTS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}

@Injectable()
export class GroupsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('GROUPS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class TicketModuleGuard implements CanLoad {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canLoad() {    
    if(this.gs.canAccessModule('TICKETS')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}

export const TicketGuard = [ TicketDashboardGuard, AllTicketGuard, TicketReportGuard, AgentsGuard, GroupsGuard ]
