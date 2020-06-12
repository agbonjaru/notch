import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../services/general.service';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent implements OnInit {
  pages = {
    'DEALS': {route: '/sales/deals-list', name: 'Deals'},
    'INVOICE': {route: '/sales/invoice-list', name: 'Invoice'},
    'SALES_ORDER': {route: '/sales/sales-order-list', name: 'Sales Order'},
    'QUOTATION': {route: '/sales/quotation-list', name: 'Quotation'},
    'SUBSCRIPTION': {route: '/sales/Subscriptions-list', name: 'Subscription'},
    'LEADS': {route: '/clients/leads', name: 'Leads'},
    'COMPANIES': {route: '/clients/companies-list', name: 'Companies'},
    'CONTACTS': {route: '/clients/contacts-list', name: 'Contacts'},
    'TEAMS': {route: '/teams/teams-list', name: 'Teams'},
    'SALESPERSON': {route: '/teams/saleperson-list', name: 'Salesperson'},
    'GAMIFICATION':  {route: '/teams/gamification', name: 'Gamification'}, 
    'TICKETS_DASHBOARD': {route: '/ticket/ticket-dashboard', name: 'Ticket Dashboard'},
    'ALL_TICKETS':  {route: '/ticket/all-ticket', name: 'All Ticket'},
    'TICKETS_REPORTS':  {route: '/ticket/ticket-reports', name: 'Ticket Reports'},
    'AGENTS':  {route: '/ticket/ticket-agents', name: 'Agents'}, 
    'GROUPS':  {route: '/ticket/ticket-groups', name: 'Groups'}, 
    'PERIOD':  {route: '/target/period', name: 'Period'},  
    'COMPANY_TARGETS':  {route: '/target/targets', name: 'Company Target'},  
    'ASSIGNED_TARGET':  {route: '/target/dashboard', name: 'Assigned Targets'},  
    'COMMISSION_PROFILES':  {route: '/target/commission-profiles', name: 'Commissiion Profiles'},  
    'COMMISSIONS':  {route: '/target/commissions', name: 'Commisions'},  

  }
  privPages: any[] = [];
  constructor(private gs: GeneralService) { 
    console.log('access-token');
    
    this.gs.priviledges.forEach(priv => {
      if(this.pages[priv]) {
        this.privPages.push(this.pages[priv])
      }
    })    
  }

  ngOnInit() {
    this.gs.showSpinner.next(false)
  }

}
