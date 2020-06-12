import { Component, Input, OnInit } from '@angular/core';
import $ from 'jquery';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TeamsService } from 'src/app/services/crew-services/teams.service';
import { GeneralService } from 'src/app/services/general.service';
import { GroupService } from 'src/app/services/ticket/group.service';
import dropDownToggle from 'src/app/utils/dropdown';
import { selectConfig } from 'src/app/utils/utils';
import { DealsService } from './../../../../services/deals.service';
import { TargetService } from './../../../../services/target.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import DateUtils from 'src/app/utils/date';

@Component({
  selector: "app-team-nav",
  templateUrl: "./team-nav.component.html",
  styleUrls: ["./team-nav.component.css"]
})
export class TeamNavComponent implements OnInit {
  p: number = 1;
  @Input() teamID: string;
  teamMemberList$: Observable<any[]>;
  private unsubscribe = new Subject<any>();
  dealList$: Observable<any[]>;
  targetList$: Observable<any[]>;
  dealWon: number = 0;
  dealLost: number = 0; loading: boolean;
  dataTable: any;
  teamdeals;
  invoiceList;
  teamsTarget;
  assignedDeals;
  salespersonList;
  showLoading: boolean = false;
  config = { ...selectConfig, placeholder: "Team Lead" };
  teamLeadModel;
  teamList: any = []; 

  constructor(
    private teamSrv: TeamsService,
    private groupSrv: GroupService,
    private gs: GeneralService,
    private dealSrv: DealsService,
    private targetSrv: TargetService,
    private invoiceServ: InvoiceService,
    private salespersonSrv: SalesPersonService,
  ) {

  }

  ngOnInit() {
    this.getTeamInvoice();
    this.teamMemberList$ = this.teamSrv.fetchTeamMembers(this.teamID) as any;
    this.targetList$ = this.targetSrv.getAssignedTeamTargets(this.teamID) as any;
    const dealList = (this.dealList$ = this.dealSrv.fetchDeals(this.teamID) as any);
    this.getAssignedTeamTargets();
    this.getAssignedDeals();
    this.getTeamDeals();   
  }

  /**
   * Refresh
   */
  public refresh() {
    this.teamMemberList$ = this.teamSrv.fetchTeamMembers(this.teamID) as any;
    this.targetList$ = this.targetSrv.getAssignedTeamTargets(this.teamID) as any;
    const dealList = (this.dealList$ = this.dealSrv.fetchDeals(this.teamID) as any);
    this.getAssignedTeamTargets();
    this.getTeamDeals();
    this.getTeamInvoice();
  }

  /**
   * Gets All SalesPerson for the ADD SALESPERSON MODAL
  */
  refreshSalesPersonList() {
    this.salespersonSrv
      .fetchActiveSalesperson()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any[]) => (this.salespersonList = data));
  }

  /**
    * GET Team By ID    
    */
  getTeamDeals() {
    this.teamSrv
      .fetchTeamId(this.teamID)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.loading = false;
        this.teamdeals = data;
      });
  }

  /**
   * GET Team Target By ID
   */
  getAssignedTeamTargets() {
    this.targetSrv.getAssignedTeamTargets(this.teamID)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.loading = false;
        this.teamsTarget = data.response.map(e => {
          e.type = this.targetSrv.getTargetType(e.type)['name'];
          e.stage = this.targetSrv.getTargetStage(e.stage)['name'];
          return e;
        });
        this.targetSrv.getTargetLists()
          .subscribe((res: any) => {
            if (res.status === 200) {
              const targets = res.response.map(e => {
                e.user_type = e.user_type === 'user' ? 'Salesperson' : 'Team';
                return e;
              });
              localStorage.target_lists = JSON.stringify(targets);
            }
          });
      });
  }

  /**
   * Fetch assigned deal by ID && TYPE 
   * WHERE TEAMS = 2
   */
  getAssignedDeals() {
    this.dealSrv
      .getMultipleDeals(this.teamID, 2)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.assignedDeals = data;
      });
  }

  toggleClass(className, dropdownClass) {
    dropDownToggle(className, dropdownClass);
  }

  /**
   * Get Team Invoice By ID
   */
  getTeamInvoice() {
    const query = `teamId=${this.teamID}`;
    this.invoiceServ.getInvoiceByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.invoiceList = data.payload
      });
  }

  /**
   * Tabs Navigation (Invoice, Quotation and SALES ORDER)
   * @param content 
   */
  openContent(content) {
    document.getElementById(`${content}-tab`).click();
    $("html, body").animate(
      { scrollTop: $(`#${content}-tab`).offset().top },
      "slow"
    );
  }

  onDeleteMember(member) {
    const salesPerson = "SalesPerson";
    this.gs.sweetAlertFileDeletions(salesPerson).then(result => {
      if (result.value) {
        this.deleteMember(member);
        this.refreshSalesPersonList();
        this.teamMemberList$ = this.teamSrv.fetchTeamMembers(this.teamID) as any; 
      }
    });
  }

  /**
   * Deleting A member from the team
   * @param member 
   */
  deleteMember(member) {
    this.groupSrv
      .removeGroupMember(parseInt(member.teamID), parseInt(member.salesPerson))
      .subscribe(
        () => {         
          this.teamMemberList$ = this.teamSrv.fetchTeamMembers(this.teamID) as any;        
          this.gs.sweetAlertSucess("Member Deleted");   
          this.refreshSalesPersonList();
        },
        err => {
          let errMsg = "sorry error occurred try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.gs.sweetAlertError(errMsg);
        }
      )
      .add(
        () =>
          (this.teamMemberList$ = this.teamSrv.fetchTeamMembers(this.teamID) as any)       
      );
  }

 
}
