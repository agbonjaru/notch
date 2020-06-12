import { Router } from "@angular/router";
import { TicketService } from "./../../services/ticket/ticket.service";
import { Component, OnInit } from "@angular/core";
import $ from "jquery";
import { exportTableToCSV } from "src/app/utils/utils";
import { BehaviorSubject } from "rxjs";
import { GeneralService } from "src/app/services/general.service";
import { GroupService } from "src/app/services/ticket/group.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-ticket-agents",
  templateUrl: "./ticket-agents.component.html",
  styleUrls: ["./ticket-agents.component.css"],
})
export class TicketAgentsComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      { title: "checkbox", key: "checkbox" },
      { title: "Agent Name", key: "name" },
      { title: "Email Address", key: "email" },
      { title: "No. Of Tickets", key: "noOfTickets" },
      { title: "Ticket Resolved", key: "totalTicketsResolved" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: ["View / Edit"],
      bulkActions: ["View / Edit"],
    },
  };
  dataFilter = {
    dataChangedObs: new BehaviorSubject(null),
    accordions: [
      // { name: "Agent Name", type: "box", search: true, filterKey: "name" },
      // { name: "Group", type: "box", search: true, filterKey: "groupName" },
      {
        name: "No of Tickets",
        type: "range",
        filterKey: "noOfTickets",
        icon: "fa fa-ticket-alt",
      },
      {
        name: "Resolved Tickets",
        type: "range",
        filterKey: "totalTicketsResolved",
        icon: "fa fa-ticket-alt",
      },
    ],
  };
  agentList: any;
  customFilters;

  constructor(
    private ticketSrv: TicketService,
    private groupSrv: GroupService,
    private toastr: ToastrService,
    private router: Router,
    private gs: GeneralService
  ) {}

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        if (data.action === "View / Edit") {
          this.viewAgent(data.data.id);
        }

        break;

      default:
        break;
    }
  };

  async dataSourceListener(event) {
    console.log(event.data);

    switch (event.action) {
      case "filter":
        this.agentList = event.data;
        this.dataTable.dataChangedObs.next(true);
        break;

      case "createFilter":
        await this.createCustomFilterAsync(event.data);
        await this.getAllCustomFiltersAsync();
        this.dataFilter.dataChangedObs.next(true);
        break;

      case "processFilter":
        await this.processCustomFilterAsync(event.data);
        this.dataTable.dataChangedObs.next(true);
        this.dataFilter.dataChangedObs.next(true);
        break;

      case "deleteFilter":
        await this.deleteCustomFilterByIdAsync(event.data);
        await this.getAllCustomFiltersAsync();
        this.dataFilter.dataChangedObs.next(true);
        break;

      case "clear":
        // Loader here
        await this.getAllAgentsAsync();
        break;

      default:
        break;
    }
  }

  async ngOnInit() {
    await this.getAllCustomFiltersAsync();
    await this.getAllAgentsAsync();
  }

  async getAllAgentsAsync() {
    try {
      this.agentList = await this.ticketSrv.fetchAgent().toPromise();
      this.dataTable.dataChangedObs.next(true);
      this.dataFilter.dataChangedObs.next(true);
    } catch (error) {
      let msg = "Error fetching agents. Please try again!";
      msg = error.error.message ? error.error.message : msg;
      this.toastr.error(msg, "Agent Error");
      console.log(error, "agent error");
    }
  }

  async getAllCustomFiltersAsync() {
    try {
      let data = await this.groupSrv.getAgentCustomFilters().toPromise();
      console.log(data, "filters");
      this.customFilters = data;
    } catch (error) {
      let msg = "Error fetching filters. Please try again!";
      msg = error.error.message ? error.error.message : msg;
      this.toastr.error(msg, "Filter Error");
      console.log(error, "filters error");
    }
  }

  async createCustomFilterAsync(data: any) {
    try {
      await this.groupSrv.newAgentCustomFilter(data).toPromise();
      this.gs.sweetAlertSucess("Filter created successfully!");
    } catch (error) {
      let msg = "Error creating filter. Please try again!";
      msg = error.error.message ? error.error.message : msg;
      this.toastr.error(msg, "Filter Error");
      console.log(error, "filters error");
    }
  }

  async processCustomFilterAsync(filter: any) {
    try {
      console.log(filter, "filter");
      let data: any = await this.groupSrv
        .getFilteredAgents(filter.noOfTickets, filter.noOfTicketsResolved)
        .toPromise();
      this.agentList = data;
      console.log(data, "data");
      // this.gs.sweetAlertSucess("Filter processed successfully!");
    } catch (error) {
      let msg = "Error filtering data. Please clear to try again!";
      msg = error.error.message ? error.error.message : msg;
      this.toastr.error(msg, "Filter Error");
    }
  }

  async deleteCustomFilterByIdAsync(id) {
    try {
      await this.groupSrv.deleteAgentCustomFilter(id).toPromise();
      this.gs.sweetAlertSucess("Filter deleted successfully!");
    } catch (error) {
      console.log(error, "filters error");
    }
  }

  viewAgent(id) {
    this.router.navigate(["/ticket/agent", id]);
  }

  exportTable() {
    const fileName = `agents_${Date.now()}`;
    const columns = [
      { title: "Agent Id", value: "id" },
      { title: "Agent Name", value: "name" },
      { title: "Agent Email", value: "email" },
      { title: "No Of Tickets", value: "noOfTickets" },
      // { title: "Total Tickets Assigned", value: "totalTicketsAssigned" },
      { title: "Total Tickets Resolved", value: "totalTicketsResolved" },
    ];
    exportTableToCSV(this.agentList, columns, fileName);
  }
}
