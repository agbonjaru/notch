import { Injectable } from '@angular/core';
import { CanActivate, Router, CanLoad } from '@angular/router';
import { GeneralService } from '../services/general.service';

@Injectable()
export class SettingsModuleGuard implements CanLoad {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canLoad() {    
    if(this.gs.isSuperAdmin) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
/* General Guard Start*/
@Injectable()
export class UserROleAccessGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('USER_ROLES_ACCESS')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class SupervisorGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('SUPERVISOR')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('ROLES')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class SubBillingGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('SUBSCRIPTION_BILLING')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class EmailNotificationGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('EMAIL_NOTIFICATIONS')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class BankSetupGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('BANK_SETUP')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class ProductAndServiceGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('PRODUCT_AND_SERVICES')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class LeadSourceGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('LEAD_SOURCE')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('TWO_FACTOR_AUTHETICATION')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class IntergrationsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('INTEGRATIONS')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class TicketInboundCommssGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('TICKET_INBOUND_COMMUNICATIONS')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class TicketSettingsGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('TICKETS_SETTINGS')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class BulkMessagesGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('BULK_MESSAGES')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
/* General Guard End */

/* Workflow Guard Start */

@Injectable()
export class SalesOrderWorkflowGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('SALES_ORDER_WORKFLOW')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class DealsWorkflowGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('DEALS_PIPELINE_WORKFLOW')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class DealLostReasonGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('DEALS_LOST_REASONS')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class GeneralApproveWorkflowGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('GENERAL_APPROVAL_WORKFLOW')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class LeadWorkflowGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('LEAD_WORKFLOW')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
/* Workflow Guard End */

/* Templates Guard Start */
@Injectable()
export class InvQuoteTemplateGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('INVOICE_AND_QUOTATION TEMPLATE')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class ChatSMSWhatsappTemplateGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('CHAT_SMS_AND_WHATSAPP')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
@Injectable()
export class EmailSeqTemplateGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('EMAIL_SEQUENCING')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
/* Templates Guard End */

/* Sales Guard Start */
@Injectable()
export class SalesCompetitorGuard implements CanActivate {
  constructor(
    private gs: GeneralService,
    private router: Router) {}
  canActivate() {    
    if(this.gs.isAuthorized('SALES_COMPETITION_TERRITORY')) {
      return true
    } else {
      this.gs.showSpinner.next(false)
      this.router.navigate(['/access-denied'])
      return false
    }
  }
}
/* Sales Guard End */

export const SettingsGuard = [
  UserROleAccessGuard, SupervisorGuard, RolesGuard, EmailNotificationGuard,BankSetupGuard, 
  ProductAndServiceGuard, LeadSourceGuard, IntergrationsGuard, TwoFactorAuthGuard, TicketSettingsGuard,
  TicketInboundCommssGuard, BulkMessagesGuard,SubBillingGuard,

  SalesOrderWorkflowGuard,DealsWorkflowGuard, DealLostReasonGuard, GeneralApproveWorkflowGuard, LeadWorkflowGuard,

  InvQuoteTemplateGuard,ChatSMSWhatsappTemplateGuard, EmailSeqTemplateGuard,

  SalesCompetitorGuard
]

