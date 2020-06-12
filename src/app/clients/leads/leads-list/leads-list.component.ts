import { Router } from "@angular/router";
import { BehaviorSubject, forkJoin, concat } from "rxjs";
import { Component, OnInit } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { LeadModel } from "src/app/models/clients/leads.model";
import { GeneralService } from "src/app/services/general.service";
import { LeadService } from "src/app/services/client-services/leads.service";
import * as $ from "jquery";
import { LeadSourceService } from "src/app/services/filters/lead-source.service";
import { ToastrService } from "ngx-toastr";
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { SignupLoginService } from 'src/app/services/signupLogin.service';

@Component({
  selector: "app-leads-list",
  templateUrl: "./leads-list.component.html",
  styleUrls: ["./leads-list.component.css"]
})
export class LeadsListComponent implements OnInit {
  orgId: number;
  userId: number;

  salespersons: any;
  teams: any;

  /** ASIGN LEAD FORM */
  selected_lead: any;
  selected_team: any = '';
  selected_salesperson: any = '';

  assign_message_class: string = '';
  assign_message: string = '';
  loading: boolean = false;

  /** */
  loadingView = false;
  leadList = [];
  leadSources;
  leadSourcesAsObject: any = {};
  loader: any = {
    default: "notch-loader",
    // default: "sharp",
    spinnerType: "",
    spinnerStyle: {},
    dataless: {
      title: "No Data Available!",
      subTitle: "Please add a lead and try again",
      action: "Add Lead",
      success: true
    },
    showSpinner: false
  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private leadService: LeadService,
    private leadSourceService: LeadSourceService,
    public genSer: GeneralService,
    private toastr: ToastrService,
    private salesperson_service: SalesPersonService,
    private signup_service: SignupLoginService
  ) {
    this.orgId = this.genSer.orgID;
    this.userId = this.genSer.user.id;
    this.loader.spinnerType = this.loader.default;
  }

  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      // { title: "checkbox", key: "checkbox" },
      { title: "ID", key: "id" },
      { title: "Source ", key: "source" },
      { title: "Value", key: "value" },
      { title: "Date Added", key: "createdOn" },
      { title: "Action", key: "action" }
    ],
    options: {
      bulkActions: [],
      singleActions: [
        {title:"View / Edit", showIf: () => this.genSer.isAuthorized('LEAD_ACTIONS')},
        {title: "Assign To", showIf: () => () => this.genSer.isAuthorized('LEAD_ACTIONS')}
      ]
    }
  };

  async ngOnInit() {
    this.genSer.showSpinner.next(false);
    await this.ngOnLoad();

    this.leadService.new_lead.subscribe((info: any) => {
      if (!this.genSer.checkIfObjectIsEmpty(info)) {
        this.leadList = this.setLeadList([info, ...this.leadList]);
        this.dataTable.dataChangedObs.next(true);
      }
    });

    this.salesperson_service.fetchActiveSalesperson().subscribe( response => {
      this.salespersons = response;
    });
  }

  dataFeedBackObsListener = data => {
    switch (data.type) {
      case "singleaction":
        if (data.action === "View / Edit") {
          if(this.genSer.isAuthorized('LEAD_ACTIONS')) {
            this.router.navigate(["/clients/leads/" + data.data.id]);
          }
        }
        
        if (data.action === 'Assign To') {
          if(this.genSer.isAuthorized('LEAD_ACTIONS')) {
            this.selected_lead = data.data;
            document.getElementById('show-assign-lead-btn').click();
          }
        }
        // else if (data.action === "Delete") {
        //   this.deleteLead(data.data.id);
        // }

        break;

      default:
        break;
    }
  };

  // Comment loading
  async ngOnLoad() {
    this.loader.showSpinner = true;
    const res = await this.intializeLeads();
    while (res) {
      this.loader.showSpinner = false;
      // this.arrayTeams = await this.getSalespersonTeams();
      break;
    }
  }

  // Get All Leads
  private async getAllLeads() {
    return await this.leadSourceService
      .filterLeadSources(`orgId=${this.orgId}`)
      .toPromise();
  }

  // Fetch All Leads
  private async fetchLeads() {
    return await this.leadService.fetchLeads().toPromise();
  }

  // Initialize Leads Setup
  private async intializeLeads() {
    const arrayLeads: { payload; success } = await this.getAllLeads();
    if ( arrayLeads === null || arrayLeads === undefined
      // ||
      // !arrayLeads.success
    ) {
      const setError = {
        title: "We couldn't load the data.",
        subTitle: "Reload to try again.",
        action: "Reload",
        success: false
      };
      this.loader.dataless = setError;
      this.loader.spinnerType = "dataless";
    } else {
      await this.setLeadSources(arrayLeads);
      return true;
    }
    console.log(arrayLeads, "arrayLeads");
    return false;
  }

  //Set Lead Sources
  private async setLeadSources(response) {
    this.leadSources = [...response.payload];
    this.leadSources.map(async source => {
      this.leadSourcesAsObject = {
        ...this.leadSourcesAsObject,
        [source.id]: source.name
      };
    });

    const arrayLeads: { payload; success } = await this.fetchLeads();
    if (arrayLeads.success) {
      this.leadList = this.setLeadList(arrayLeads.payload);
      this.dataTable.dataChangedObs.next(true);
    } else this.toastr.error("Something went wrong!", "Error");
  }

  //Set Lead List
  private setLeadList(payload) {
    return payload.map(lead => {
      const value = lead.sourceValue;
      const source = lead.source;

      const createdOn = new Date(lead.createdAt).toDateString();
      return {
        ...lead,
        source,
        value,
        createdOn
      };
    });
  }

  filterLeads(queryString: string): void {
    this.leadService.filterLead(queryString).subscribe(response => {
      this.leadList = this.setLeadList(response.payload);
      this.dataTable.dataChangedObs.next(true);
    });
  }

  /**
   * Loads up the teams of a selected sales person
   */
  load_salesperson_teams() {
    this.teams = [];
    const salesperson_id = this.salespersons[this.selected_salesperson].id;
    this.signup_service.fetchsalesPersonTeams(salesperson_id).subscribe( response => {
      this.teams = response;
    }, error => {
      console.log(`$Error: ${error.message}`);
    });
  }

  assignLead() {
    if (!this.selected_lead.id) {
      this.display_assign_message('Please select a Lead', false);
      return
    }

    if (!this.selected_salesperson) {
      this.display_assign_message('Please select a Salesperson', false);
      return
    }

    if (!this.selected_team) {
      this.display_assign_message('Please select a Team', false);
      return
    }

    const leadInfo = {...this.selected_lead};
    const teamId = this.teams[this.selected_team].teamID;
    const owner = this.salespersons[this.selected_salesperson].id;
    
    this.loading = true;
    this.leadService.updateLead({ ...leadInfo, teamId, owner }).subscribe(response => {
      this.loading = false;
      if (response.success) {
        this.display_assign_message('Lead assigned successfully', true);
        this.leadList[this.selected_lead] = response.payload;
        this.leadList = this.setLeadList(this.leadList);
        this.dataTable.dataChangedObs.next(true);
        return;
      }

      this.display_assign_message('Lead could not be assigned', false);
    }, error => {
      this.loading = false;
      console.log(error.message);
    });
  }

  deleteLead(id) {
    $("#ModalCenter4 .close").click();
    this.genSer.sweetAlertFileDeletions("Lead").then(res => {
      if (res.value) {
        this.leadService.deleteLead(id).subscribe(response => {
          if (response.success) {
            this.leadList = this.leadList.filter(lead => lead.id != id);
            this.dataTable.dataChangedObs.next(true);
          }
        });
      }
    });
  }

  display_assign_message(message: string, success: boolean) {
    this.assign_message_class = success ? 'alert alert-success' : 'alert alert-danger';
    this, this.assign_message = message;

    setTimeout(() => {
      this.assign_message_class = '';
      this.assign_message = '';
    }, 3000);
  }

  // Allow user to add a lead when there is none.
  async onActionState() {
    console.log("onActionState from leads");
    if (this.loader.dataless.success === true) $("#ModalCenter4").show();
    else await this.reloadSpinner();
  }

  // Reload Spinner
  async reloadSpinner() {
    console.log("i am  reloadSpinner from company");
    this.loader.spinnerType = this.loader.default;
    await this.ngOnLoad();
  }
}
