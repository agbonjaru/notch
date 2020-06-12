import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as $ from 'jquery';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { TargetService } from 'src/app/services/target.service';
import { TeamsService } from 'src/app/services/crew-services/teams.service';
import { GeneralService } from 'src/app/services/general.service';
import { AppState } from 'src/app/store/app.state';
import { selectConfig } from 'src/app/utils/utils';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { TeamNavComponent } from './team-nav/team-nav.component';
import { EmailService } from 'src/app/services/integrations/email/email.service';
import { QuotationService } from 'src/app/services/quotation.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { CustomValidators } from 'ngx-custom-validators';
import { LeadSourceService } from 'src/app/services/filters/lead-source.service';
import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { CompaniesService } from 'src/app/services/client-services/companies.service';
import { SalesOrderService } from 'src/app/services/sales-order.service';

@Component({
  selector: "app-team-view",
  templateUrl: "./team-view.component.html",
  styleUrls: ["./team-view.component.css"]
})
export class TeamViewComponent implements OnInit, OnDestroy {
  p: number = 1;
  @ViewChild('teamsComponent') teamsComponent: TeamNavComponent;
  salespersonForm: any[];
  teamMemberList$: Observable<any[]>;
  salespersonList = [];
  teamID;
  userID;
  team;
  teamMember;
  memberEmails = [];
  id: any;
  newTeamName: string;
  noOfDeals: any;
  noOfDealsLost: any;
  noOfDealsWon: any;
  noOfInvoices: any;
  self: any;
  teamLead: any;
  enabled: any;
  showLoading;
  quoteList;
  invoiceList;
  assignedSalesOrder;
  loading: boolean = false;
  loadingView: boolean = false;
  teamListById;
  _isCurrencyEnabled: boolean = true;
  targets: Observable<any>;
  periods: Observable<any>;
  assignedTargets: Array<{}> = [];
  targetList: Array<{}> = [];
  periodList: Array<{}> = [];
  targetForm: FormGroup;
  target_limit: Number = 0;
  selectedTarget;
  leadsList;
  contactList;
  companyLists;
  targetStageList$ = this.targetService.getTargetStagesDropdown();
  targetStageConfig = {
    ...selectConfig,
    displayKey: 'description'
  };
  targetsConfig = {
    search: true,
    placeholder: "Select Target",
    limitTo: 10,
    noResultsFound: "No targets available!",
    searchPlaceholder: "search"
  };
  periodsConfig = {
    search: true,
    placeholder: "Select Periods",
    limitTo: 10,
    noResultsFound: "No periods available!",
    searchPlaceholder: "search"
  };
  config = { ...selectConfig, placeholder: "Salesperson" };
  data = { teamID: null, salesPerson: null };
  private unsubscribe = new Subject();

  loader: any = {
    default: "notch-loader",
    spinnerType: "",
    spinnerStyle: {},
    dataless: {
      title: "No Data Available!",
      subTitle: "Please  try again",
      action: "Load Teams",
      success: true
    },
    showSpinner: false
  };

  constructor(
    route: ActivatedRoute,
    private fb: FormBuilder,
    private teamsSrv: TeamsService,
    private teamSrv: TeamsService,
    private salespersonSrv: SalesPersonService,
    private targetService: TargetService,
    private authSrv: AuthService,
    private emailSrv: EmailService,
    private quoteSrv: QuotationService,
    private invoiceServ: InvoiceService,
    public generalService: GeneralService,
    private leadSrv: LeadSourceService,
    private contactSrv: ContactsService,
    private salesOrderSrv: SalesOrderService,
    private CompaniesSrv: CompaniesService,
    private router: Router,
    store: Store<AppState>
  ) {
    this.loader.spinnerType = this.loader.default;
    this.teamID = route.snapshot.paramMap.get("id");
    store.select("userInfo").subscribe(info => {
      this.userID = info.user.id;
    });
  }

  ngOnInit() {
    this.getTeam();
    this.fetchTeamId();
    this.getTeamInvoice();
    this.getAllSalesperson();
    this.getTargets();
    this.getAssignedSalesOrder()
    this.getTeamQuotation();
    this.getTeamsLeads();
    this.getTeamsContacts();
    this.getTeamsCompany();
    this.createTargetForm();
  }

  /**
   * Fetching all Team Members (SalesPersons in the Team)
   */
  getTeam() {
    this.loader.showSpinner = true;
    this.teamsSrv
      .fetchTeamId(this.teamID)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.initializeLoad(data);
        this.getTeamMembers();
        this.passDataToEmailConText();
      });
  }

  /**
  * Internet Loading
  * @param data 
  */
  initializeLoad(data) {
    if (data === null || data === undefined) {
      const setError = {
        title: "We couldn't load the data.",
        subTitle: "Kindly Check your Internet & Click Reload to try again.",
        action: "Reload",
        success: false
      };
      this.loader.dataless = setError;
      this.loader.spinnerType = "dataless";
    } else {
      this.team = data
      this.loader.showSpinner = false;
    }
  }

  /** 
  * Fetching Teams by Id
  */
  fetchTeamId() {
    this.loading = true;
    this.teamSrv
      .fetchTeamId(this.teamID)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => {
        this.loading = false;
        this.teamListById = data;
        this.teamLead = this.teamListById.teamLead;
        this.enabled = this.teamListById.enabled;
        this.id = this.teamListById.teamID;
        this.newTeamName = this.teamListById.teamName;
        this.noOfDeals = this.teamListById.noOfDeals;
        this.noOfDealsLost = this.teamListById.noOfDealsLost;
        this.noOfDealsWon = this.teamListById.noOfDealsWon;
        this.noOfInvoices = this.teamListById.noOfInvoices;
        this.self = this.teamListById.self
      });
  }

  /**
   * Get Team Quotation
   */
  getTeamQuotation() {
    const query = `teamId=${this.teamID}`;
    this.quoteSrv.getQuotationByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.quoteList = data.payload;
      });
  }

  /**
   * Get Team Invoice By ID
   */
  getTeamInvoice() {
    const query = `teamId=${this.teamID}`;
    this.invoiceServ.getInvoiceByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.invoiceList = data.payload;
      });
  }

  /**
  * Fetch Leads Assigns to a Teams
  */
  getTeamsLeads() {
    const query = `teamId=${this.teamID}`;
    this.leadSrv.filterLead(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.leadsList = data.payload
      });
  }

  /**
 * Fetch assigned salesOrder by ID && TYPE 
 * WHERE Teams = 2
 */
  getAssignedSalesOrder() {
    this.salesOrderSrv
      .getMultipleSalesOrders(this.teamID, 2)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.assignedSalesOrder = data;
      });
  }
  /**
     * Open SalesOrder
     * @param salesOrder 
     */
  openSalesOrder(salesOrderId) {
    this.router.navigate(["/sales/create-sales-order"], {
      queryParams: { salesOrder: salesOrderId },
    });
  }


  /**
 * Fetch Contacts Assigns to a Teams
 */
  getTeamsContacts() {
    const query = `teamId=${this.teamID}`;
    this.contactSrv.getContactsByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.contactList = data.payload
      });
  }

  /**
  * Fetch Contacts Assigns to a Teams
  */
  getTeamsCompany() {
    const query = `teamId=${this.teamID}`;
    this.CompaniesSrv.getCompaniesByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.companyLists = data.payload
      });
  }

  /**
   * TeamMembers
   */
  getTeamMembers() {
    this.teamSrv.fetchTeamMembers(this.teamID)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.teamMember = data
        this.memberEmails = this.teamMember.map(member => member.email);
      });
  }

  /**
   * Passing Email COntent Data
   */
  passDataToEmailConText() {
    const context_data = {
      name: "teams", //Team Name
      data: {
        id: this.team.id,// Team Id
        email_list: this.memberEmails // Array of emails of team members
      }
    }
    this.emailSrv.email_context.next(context_data)
  }

  /**
   * Update Teams
   */
  updateTeam() {
    this.showLoading = true;
    this.teamSrv
      .updateTeam(this.teamID,
        this.noOfDeals,
        this.newTeamName,
        this.noOfDealsLost,
        this.noOfDealsWon,
        this.noOfInvoices,
        this.self,
        this.teamLead,
        this.enabled)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        () => {
          this.showLoading = false;
          $("#closeUpdateTeamModal").click();
          this.generalService.sweetAlertSucess("Team updated successfully!");
          this.getTeam();
        },
        err => {
          let errMsg = "Error occured try again";
          errMsg =
            err && err.error && err.error.message ? err.error.message : errMsg;
          this.showLoading = false;
          this.generalService.sweetAlertSucess(errMsg);
        }
      );

  }

  updateTeamId(res) {
    if (!this.teamID) {
      const checkMember = res.salesPerson.filter(
        person => person.memberID == this.userID
      );
      if (checkMember && checkMember.length) {
        this.authSrv.updateUser({ teamID: res.teamID });
      }
    }
  }

  openTeamLeadModal(teamId) {
    this.data.teamID = teamId;
  }

  /** to refresh the member list on the Teams View
   * for whenever a sales person is added
   */
  refreshMemberList() {
    this.teamMemberList$ = this.teamSrv.fetchTeamMembers(
      this.teamID
    ) as any;
  }

  /** 
   * Add salesPerson to a team
   */
  addSalesPerson() {
    if (this.salespersonForm.length) {
      this.showLoading = true;
      const data = this.salespersonForm.map(user => {
        return {
          memberID: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone || null
        };
      });
      this.data.salesPerson = data;
      this.data.teamID = this.teamID;
      this.teamSrv.addSalesperson(this.data)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (res: any) => {
            $("button.close").click();
            this.generalService.sweetAlertSucess(
              "Team Member(s) has been added"
            );
            this.teamsComponent.refresh();
          },
          err => {
            this.showLoading = false;
            alert("error occurred");
          }
        )
        .add(
          () =>
            (this.refreshMemberList())
        );
    }
  }

  /**Gets All SalesPerson for the ADD SALESPERSON MODAL
   * GET
   */
  getAllSalesperson() {
    this.salespersonSrv
      .fetchActiveSalesperson()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any[]) => (this.salespersonList = data));
  }

  /** Close Sales Person Modal */
  closeModal() {
    this.salespersonForm = null;
    // this.getAllSalesperson();
  }

  private getTargets() {
    this.targetService.getTargets()
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.targetList = res.response;
          this.targets = new Observable(observer => {
            observer.next(
              res.response.map(e => {
                return { id: e.id, description: `${e.title} (${e.type})` };
              })
            );
          });
        }
      });
  }

  getPeriods() {
    const target = this.targetForm.value.target;
    if (!target || !target.id) return;
    const target_obj = (this.targetList.filter(e => {
      return e['id'] === Number(target.id);
    }))[0];
    this.selectedTarget = target_obj;
    this.setCurrencyEnabledStatus();
    this.targetForm.get('period').reset();
    this.targetForm.get('stage').reset();
    this.targetStageList$ = this.targetService.getTargetStagesDropdown(target_obj['type']);
    this.targetService.getTargetPeriods(target.id)
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.periods = new Observable(observer => {
            observer.next(
              res.response.map(e => {
                return { id: e.id, description: e.name };
              })
            );
          });
          this.getTargetLimit();
        }
      });
  }

  private getTargetLimit() {
    const target = this.targetForm.value.target;
    if (!target || !target.id) return;
    this.targetService.getTargetLimit(target.id)
      .subscribe((res: any) => {
        if (res.status === 200)
          this.target_limit = res.response.unallocated;
      });
  }

  private getAssignedTargets() {
    this.loadingView = true;
    this.targetService
      .getAssignedTeamTargets(this.teamID)
      .subscribe((res: any) => {
        this.loadingView = false;
        if (res.status === 200) this.assignedTargets = res.response;
      });
  }

  createTargetForm() {
    this.targetForm = this.fb.group({
      target: ["", Validators.required],
      period: ["", Validators.required],
      value: ["",
        [
          Validators.required,
          CustomValidators.number
        ]
      ],
      stage: [""]
    });
  }

  setCurrencyEnabledStatus() {
    this._isCurrencyEnabled = (
      this.selectedTarget.type === 'revenue' ||
      this.selectedTarget.type === 'markup' ||
      this.selectedTarget.type === 'product_revenue'
    ) ? true : false;
    if (this._isCurrencyEnabled) {
      this.targetForm.get('value').setValidators([Validators.required, CustomValidators.number]);
    } else {
      this.targetForm.get('value').setValidators([Validators.required, CustomValidators.digits]);
    }
    this.targetForm.get('value').updateValueAndValidity();
  }

  assignTarget() {
    const targetDetails = this.targetForm.value;
    $("#ModalCenter2 .close").click();
    this.generalService.sweetAlertFileCreations("Target").then(res => {
      if (res.value) {
        let obj = {
          userId: this.teamID,
          targetId: targetDetails.target.id,
          sub_periodId: targetDetails.period.id,
          value: targetDetails.value
        };
        if (targetDetails.stage)
          obj['stage'] = targetDetails.stage.id;
        if (!obj.targetId || !obj.sub_periodId || !obj.value)
          return this.generalService.notification(
            "Kindly fill all required field(s)",
            "",
            "warning"
          );
        if (parseFloat(obj.value) > this.target_limit)
          return this.generalService.notification(
            `Insufficient unallocated target (${this.target_limit})`,
            "",
            "warning"
          );
        obj["periodId"] = this.targetList.filter(e => {
          return e["id"] === Number(obj.targetId);
        })[0]["period"];
        this.loading = true;
        this.targetService.addAssignedTeamTarget(obj)
          .subscribe((response: any) => {
            this.loading = false;
            if (response.status === 200) {
              this.generalService.notification(
                "Target assigned successfully!",
                "",
                "success"
              );
              this.targetForm.reset();
              this.teamsComponent.refresh();
              this.getTargetLimit();
            } else {
              this.generalService.notification(response.error, "", "error");
            }
          },
            error => {
              this.loading = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            });
      }
    });
  }

  reverseAssignTarget(id) {
    $("#ModalCenter2 .close").click();
    this.generalService.sweetAlertFileDeletions("Target").then(result => {
      if (result.value) {
        this.targetService
          .deleteAssignedTeamTarget(id, this.teamID)
          .subscribe(
            result2 => {
              if (result2) {
                Swal.fire(
                  "Deleted!",
                  "Your file has been deleted.",
                  "success"
                ).then(res => {
                  this.getAssignedTargets();
                  this.getTargetLimit();
                });
              }
            },
            error => {
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
      }
    });
  }


  // Reload Spinner
  async reloadSpinner() {
    this.loader.spinnerType = this.loader.default;
    window.location.reload();
  }

  // Allow user to add a lead when there is none.
  async onActionState() {
    if (this.loader.dataless.success === true) $("#ModalCenter4").show();
    else await this.reloadSpinner();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
