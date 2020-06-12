import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { TeamsService } from 'src/app/services/crew-services/teams.service';
import { GeneralService } from 'src/app/services/general.service';
import { TargetService } from 'src/app/services/target.service';
import { AppState } from 'src/app/store/app.state';
import { exportTableToCSV, selectConfig } from 'src/app/utils/utils';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as $ from 'jquery';

import { AuthService } from './../../../auth/auth.service';
import { noWhitespaceValidator } from 'src/app/utils/no-whitespace.validator';
import { CustomValidators } from 'ngx-custom-validators';
import { TeamsSideBarComponent } from './teams-side-bar/teams-side-bar.component';

@Component({
  selector: "app-teams-list",
  templateUrl: "./teams-list.component.html",
  styleUrls: ["./teams-list.component.css"]
})

export class TeamsListComponent implements OnInit, OnDestroy {

  @ViewChild(TeamsSideBarComponent) teamSidebar: TeamsSideBarComponent;

  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      // { title: "checkbox", key: "checkbox" },
      { title: "Team Name", key: "teamName" },
      { title: "Number Of Members", key: "noOfTeamMembers" },
      { title: "No. of Deals", key: "noOfDeals" },
      // { title: "No. of Invoices", key: "noOfInvoices" },
      { title: "Deals Won", key: "noOfDealsWon" },
      { title: "Deals Lost", key: "noOfDealsLost" },
      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},
      singleActions: [
        "View / Edit",
        "Rename",
        "Add Sales Person",
        "Assign Target",
      ]
    }
  };
  _isCurrencyEnabled: boolean = true;
  selectedTarget;
  targetStageList$ = this.targetService.getTargetStagesDropdown();
  targetStageConfig = {
    ...selectConfig,
    displayKey: 'description'
  };
  config = {
    ...selectConfig,
    placeholder: "Salesperson",
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

  private unsubscribe = new Subject<any>();
  newTeamName: string;
  id: any;
  noOfDeals: any;
  noOfDealsLost: any;
  noOfDealsWon: any;
  noOfInvoices: any;
  self: any;
  teamLead: any;
  enabled: any;
  newTeamID;
  arrayTeam: any
  teamLeadModel;
  teamsList: any[];
  teamList;
  teamListById;
  from;
  to;
  teamLeader;
  showLoading;
  userID;
  teamID;
  orgID;
  salesTeam;
  teamsForm: FormGroup;
  target_limit: Number = 0;
  targetForm: FormGroup;
  loading: boolean = false;
  loadingView: boolean = false;
  targets: Observable<any>;
  periods: Observable<any>;
  assignedTargets: Array<{}> = [];
  targetList: Array<{}> = [];
  periodList: Array<{}> = [];
  salespersonList = [];
  salespersonForm: any[];
  fullList = "col-xl-12 col-lg-12 col-md-12";
  list = "col-xl-10 col-lg-9 col-md-8";
  sidebarFilter = "open";
  mainStyle = this.list;
  dealList: any[];
  data = { teamID: null, salesPerson: null };

  constructor(
    private fb: FormBuilder,
    private teamSrv: TeamsService,
    private targetService: TargetService,
    private salespersonSrv: SalesPersonService,
    public generalService: GeneralService,
    private router: Router,
    private authSrv: AuthService,
    store: Store<AppState>
  ) {
    this.loader.spinnerType = this.loader.default;
    store.select("userInfo").subscribe(info => {
      this.userID = info.user.id;
      this.orgID = info.organization.id;
    });
  }

  dataFeedBackObsListener = data => {
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        if (data.action === "View / Edit") {
          this.router.navigate(['/teams/team/' + data.data.teamID]);

        } else if (data.action === "Assign Commission") {
          this.openSalespersonModal(data.data.teamID)

        } else if (data.action === "Assign Target") {
          //@ts-ignore
          document.querySelector("[data-target='#targetModal'").click()
          this.openAssignedTargetModal(data.data)

        } else if (data.action === "Rename") {
          //@ts-ignore
          document.querySelector("[data-target='#ModalCenter5'").click()
          this.onRenameTeam(data.data)

        } else if (data.action === "Add Sales Person") {
          //@ts-ignore
          document.querySelector("[data-target='#ModalCenter2'").click()
          this.onTeam(data.data)

        } else if (data.action === "Assign Lead") {

          //@ts-ignore
          document.querySelector("[data-target='#ModalCenter'").click()
        }

        break;

      default:
        break;
    }
  };


  ngOnInit() {
    this.generalService.showSpinner.next(false);
    this.getAllTeams();
    this.createTargetForm();
    this.getTargets();
    this.getAllSalesperson();

    // forms validation Form with Adding Industry
    this.teamsForm = this.fb.group({
      teamname: ['', [Validators.required, noWhitespaceValidator]],
    });
  }

  /**
   * Getting All Teams
   */
  getAllTeams() {
    this.loader.showSpinner = true;
    this.teamSrv
      .fetchAllTeams()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any[]) => {
        this.initializeLoad(data);
        this.dataTable.dataChangedObs.next(true);
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
      this.teamList = data;
      this.loader.showSpinner = false;
    }
  }

  /**
   * Creating Filter
   * @param $event 
   */
  createFilter($event) {
    this.loading = true;
    const filter = $event.value;
    this.teamList = this.teamList.filter(
      e =>
        e.totalNumberOfDeals === filter.noOfDeals &&
        e.noOfDealsLost === filter.noOfDealsLost &&
        e.noOfDealsWon === filter.noOfDealsWon &&
        e.noOfInvoice === filter.noOfInvoices
    );
    this.refreshFilterForm();
    this.dataTable.dataChangedObs.next(true);
    $.getScript("../../../assets/js/datatableScript.js");
    this.loading = false;
  }

  /**
   * Refresh Create Filter Form
   */
  refreshFilterForm() {
    this.noOfDeals.reset();
    this.noOfInvoices.reset();
    this.noOfDealsLost.reset();
    this.noOfDealsWon.reset();
  }

  /**
   * Fetching Teams by Id
   * @param teamID  
   */
  fetchTeamId(teamID) {
    this.loading = true;
    this.teamSrv
      .fetchTeamId(teamID)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => {
        this.loading = false;
        this.teamListById = data;
        this.teamLead = this.teamListById.teamLead;
        this.enabled = this.teamListById.enabled;
      });
  }

  /**
   * Fetching  Filtered Teams by ID
   * @param id 
   */
  getFilteredTeams(id) {
    this.loader.showSpinner = true;
    this.teamsList = null;
    this.teamSrv.getFilteredTeams(id).subscribe((data: any) => {
      this.loader.showSpinner = false;
      this.initializeLoad(data);

      this.dataTable.dataChangedObs.next(true);
    });
  }

  clearFilters() {
    this.getAllTeams();
    this.teamSidebar.getAllFilters();
  }

  /**
  * Fetching  Filtered Teams by invoice
  */
  getInvoiceFilter(invoice: FormGroup) {
    this.loading = true;
    this.teamsList = null;
    this.teamSrv.getFilteredTeamsByNumberOfInvoices(invoice.value).subscribe((data: any) => {
      this.teamList = data;
      this.dataTable.dataChangedObs.next(true);
      $.getScript("../../../assets/js/datatableScript.js");
    });
  }

  /**
  * Fetching  Filtered Teams by Deals Total
  * * @param deals
  */
  getDealsFilter(deals: FormGroup) {
    this.loader.showSpinner = true;
    this.teamsList = null;
    this.teamSrv.getFilteredTeamsByDeal(deals.value).subscribe((data: any) => {
      this.initializeLoad(data);
      this.dataTable.dataChangedObs.next(true);
    });
  }

  /**
   * Fetching  Filtered Teams by Deals Lost
   * @param lost 
   */
  getDealLostFilter(lost: FormGroup) {
    this.loader.showSpinner = true;
    this.teamsList = null;
    this.teamSrv.FilteredSalesPersonsByNumberOfDealsLost(lost.value).subscribe((data: any) => {
      this.initializeLoad(data);
      this.dataTable.dataChangedObs.next(true);
    });
  }

  /**
   * Fetching  Filtered Teams by Deals Won
   * @param won 
   */
  getDealWonFilter(won: FormGroup) {
    this.loader.showSpinner = true;
    this.teamsList = null;
    this.teamSrv.FilteredSalesPersonsByNumberOfDealsWon(won.value).subscribe((data: any) => {
      this.initializeLoad(data);
      this.dataTable.dataChangedObs.next(true);;
    });
  }

  checkAll() {
    if (this.teamList.every(val => val.isSelected == true))
      this.teamList.forEach(val => {
        val.isSelected = false;
      });
    else
      this.teamList.forEach(val => {
        val.isSelected = true;
      });
    this.dataTable.dataChangedObs.next(true);
  }

  onChangeCheckbox(team) {
    this.teamList.filter(val => {
      if (val.teamID === team.teamID && team.isSelected === true)
        val.isSelected = false;
      else if (val.teamID === team.teamID && team.isSelected === false)
        val.isSelected = true;
    });
    this.dataTable.dataChangedObs.next(true);
  }

  /**
   * Export TO Excel .CSV
   */
  exportTable() {
    const exportName = "team-list-" + Date.now();
    const columns = [
      { title: "Team Name", value: "teamName" },
      { title: "No of Team Members", value: "noOfTeamMembers" },
      { title: "No of Deals", value: "noOfDeals" },
      { title: "Deals Won", value: "noOfDealsWon" },
      { title: "Deals Lost", value: "noOfDealsLost" },
      // { title: "No of Invoices", value: "noOfInvoices" },
    ];
    exportTableToCSV(this.teamList, columns, exportName);
  }

  /**
   * Router to Open Team
   * @param team 
   */
  openTeam(team) {
    this.router.navigate(["/teams/team", team.teamID]);
  }

  /**
   * Toggle Side Bar For Teams Custom Filter
   * @param type 
   */
  toggleFilter(type) {
    this.mainStyle = type === "open" ? this.list : this.fullList;
    this.sidebarFilter = type === "open" ? "open" : "close";
  }

  /**
   * Passing Team DTO
   */
  teamData() {
    const payload = {
      dealsLost: "0",
      dealsWon: "0",
      enabled: true,
      noOfDeals: 0,
      noOfInvoices: 0,
      orgID: this.orgID,
      teamCount: 0,
      teamName: this.teamsForm.value.teamname,
      members: [],
    };
    return payload
  }

  /**
   * sweet Alert Sucess / Sweet Alert Teams_Exit For TEAMS
   * @param result 
   */
  swalTeam(result) {
    if (result.status === "TEAM_EXITS") {
      this.generalService.sweetAlertError("Team Name Already Exits!!, Choose A New Name");
    } else if (result.status === "SUCCESS!") {
      this.generalService.sweetAlertSucess("New Team Created");
    }
  }

  /** 
    * Adding Teams to the Table
   * @param teamname 
   */
  addTeam() {
    this.showLoading = true;
    // stop here if form is invalid
    if (this.teamsForm.invalid) return;
    const payload = this.teamData();
    this.teamSrv
      .createTeam(payload).subscribe(
        (result: any) => {
          $("#closeAddTeamModal").click();
          this.swalTeam(result)
          this.showLoading = false;
          this.getAllTeams();
          this.teamsForm.reset();
        },
        err => {
          $("#closeAddTeamModal").click();
          let errMsg = "Error occurred try again";
          errMsg =
            err && err.error && err.error.message
              ? err.error.message
              : errMsg;
          this.showLoading = false;
          this.generalService.sweetAlertError(errMsg);
        }
      ).add(() => {
        $("#closeAddTeamModal").click();
        this.teamsForm.reset();
      });
  }

  /**
   * Rename Parameters
   * @param team 
   */
  onRenameTeam(team: any) {
    this.fetchTeamId(team.teamID);
    this.newTeamName = team.teamName;
    this.id = team.teamID;
    this.noOfDeals = team.noOfDeals;
    this.noOfDealsLost = team.noOfDealsLost;
    this.noOfDealsWon = team.noOfDealsWon;
    this.noOfInvoices = team.noOfInvoices;
    this.self = team.self;
  }

  onTeam(team: any) {
    this.newTeamID = team.teamID;
    this.arrayTeam = team;
  }

  /**
   * Updating Teams (Rename)
   */
  updateTeam() {
    this.showLoading = true;
    this.teamSrv
      .updateTeam(this.id,
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
          this.getAllTeams();
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

  /**
   * Adding a salesPerson to teams
   */
  addSalesPerson() {
    if (this.salespersonForm.length) {
      const data = this.salespersonForm.map(user => {
        return {
          memberID: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone || null
        };
      });
      this.data.salesPerson = data;
      this.data.teamID = this.newTeamID;
      this.showLoading = true;
      this.teamSrv
        .addSalesperson(this.data)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (res: any) => {
            this.updateTeamId(res);
            this.showLoading = false;
            $("button.close").click();
            this.generalService.sweetAlertSucess(
              "Team Member(s) has been added"
            );
          },
          err => {
            this.showLoading = false;
            alert("error occured");
          }
        )
        .add(() => this.getAllTeams());
    }
  }

  closeModal() {
    this.salespersonForm = null;
    this.getAllSalesperson();
  }

  openSalespersonModal(teamId) {
    this.data.teamID = teamId;
  }

  openTeamLeadModal(teamId) {
    this.data.teamID = teamId;
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

  /**
   * Getting All Active SalesPerson 
   */
  getAllSalesperson() {
    this.salespersonSrv
      .fetchActiveSalesperson()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any[]) => (this.salespersonList = data));
  }

  /**
   * Open Assign target Modal
   * @param team 
   */
  openAssignedTargetModal(team) {
    this.salesTeam = team;
    this.getAssignedTargets();
  }

  /**
   * Get Teams Target
   */
  private getTargets() {
    this.targetService.getTargets().subscribe((res: any) => {
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

  /**
   * Get Targets Periods
   */
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
      .getAssignedTeamTargets(this.salesTeam.teamID)
      .subscribe((res: any) => {
        this.loadingView = false;
        if (res.status === 200) this.assignedTargets = res.response;
      });
  }

  /**
   * Create Target Form
   */
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

  /**
   * AssignTargets and Also Validate
   */
  assignTarget() {
    const targetDetails = this.targetForm.value;
    $("#targetModal .close").click();
    this.generalService.sweetAlertFileCreations("Target").then(res => {
      if (res.value) {
        let obj = {
          userId: this.salesTeam.teamID,
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
              this.getAssignedTargets();
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
    $("#targetModal .close").click();
    this.generalService.sweetAlertFileDeletions("Target").then(result => {
      if (result.value) {
        this.targetService
          .deleteAssignedTeamTarget(id, this.salesTeam.teamID)
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
    await this.getAllTeams();
    await this.teamSidebar.getAllFilters();
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
