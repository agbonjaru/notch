import { Injectable } from '@angular/core';
import { CanActivate, Router, CanLoad } from '@angular/router';
import { GeneralService } from '../services/general.service';

@Injectable()
export class DealGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {        
    if(this.gs.isAuthorized('DEALS')) {      
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class AddDealGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('ADD_DEAL')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}

@Injectable()
export class InvoiceGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('INVOICE')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class SalesOrderGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('SALES_ORDER')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}

@Injectable()
export class QuotationGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('QUOTATION')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('SUBSCRIPTION')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class SalesModuleGuard implements CanLoad {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canLoad() {    
    if(this.gs.canAccessModule('SALES')) {
      return true
    } else {
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
export const salesGuard = [ 
  DealGuard, AddDealGuard, 
  InvoiceGuard, SalesOrderGuard, 
  QuotationGuard, SubscriptionGuard, 
 ]
