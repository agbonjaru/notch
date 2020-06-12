import { AuthService } from "./../../auth/auth.service";
import { Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { Subject, BehaviorSubject } from "rxjs";
import { GeneralService } from "./../../services/general.service";
import { GroupService } from "./../../services/ticket/group.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { selectConfig, exportTableToCSV } from "./../../utils/utils";
import { TicketService } from "./../../services/ticket/ticket.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import $ from "jquery";
import { REMOVESPACESONLY } from "src/app/helpers/helperResources";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-ticket-groups",
  templateUrl: "./ticket-groups.component.html",
  styleUrls: ["./ticket-groups.component.css"],
})
export class TicketGroupsComponent implements OnInit, OnDestroy {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "checkbox", key: "checkbox" },
      { title: "Group Name", key: "groupName" },
      { title: "No of Members", key: "noOfTeamMembers" },
      { title: "No. Of Tickets", key: "noOfTickets" },
      // { title: "Ticket Assigned", key: "noOfTicketsAssigned" },
      { title: "Ticket Resolved", key: "noOfTicketsResolved" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: ["View / Edit", "Add Agent", "Rename"],
      bulkActions: ["View / Edit"],
    },
  };
  loading = false;
  unsubscribe = new Subject();
  agentList$ = this.ticketSrv.fetchAgent();
  config = selectConfig;
  groupList: any = [];
  agents = [];
  agentLoading = false;
  selectedGroup;
  groupName: any = {};
  customFilters;
  dataFilter = {
    dataChangedObs: new BehaviorSubject(null),
    accordions: [
      // { name: "Group Name", type: "box", search: true, filterKey: "name" },
      // { name: "Group", type: "box", search: true, filterKey: "groupName" },
      {
        name: "No of Members",
        type: "range",
        filterKey: "noOfTeamMembers",
        icon: "fa fa-user",
      },
      {
        name: "No of Tickets",
        type: "range",
        filterKey: "noOfTickets",
        icon: "fa fa-ticket-alt",
      },
      // {
      //   name: "Assigned Tickets",
      //   type: "range",
      //   filterKey: "noOfTicketsAssigned",
      //   icon: "fa fa-ticket-alt",
      // },
      {
        name: "Resolved Tickets",
        type: "range",
        filterKey: "noOfTicketsResolved",
        icon: "fa fa-ticket-alt",
      },
    ],
  };
  addGroupForm = new FormGroup({
    name: new FormControl("", [Validators.required, REMOVESPACESONLY]),
    members: new FormControl([], Validators.required),
  });
  dataSource: any = {
    agent: [],
    group: [],
  };
  loader: any = {};
  nameExist: boolean = false;

  constructor(
    private ticketSrv: TicketService,
    private groupSrv: GroupService,
    private toastr: ToastrService,
    private authSrv: AuthService,
    public gs: GeneralService,
    private datepipe: DatePipe,
    private router: Router
  ) {
    console.log(this.agentList$, "agents");
  }

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        if (data.action === "View / Edit") {
          this.open(data.data.groupID);
        } else if (data.action === "Rename") {
          this.selectGroup(data.data);
          //@ts-ignore
          document.querySelector("[data-target='#RenameGroupModal'").click();
        } else if (data.action === "Add Agent") {
          this.selectGroup(data.data);
          //@ts-ignore
          document.querySelector("[data-target='#ModalCenter5'").click();
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
        this.groupList = event.data;
        this.dataTable.dataChangedObs.next(true);
        break;

      case "createFilter":
        await this.createCustomFilterAsync(event.data);
        await this.getAllCustomFiltersAsync();
        this.dataFilter.dataChangedObs.next(true);
        break;

      case "updateFilter":
        await this.updateCustomFilterAsync(event.data);
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
        await this.getGroup();
        break;

      default:
        break;
    }
  }

  async ngOnInit() {
    this.getGroup(true);
    await this.getAllCustomFiltersAsync();
    await this.getAllAgentsAsync();
  }

  get gf() {
    return this.addGroupForm.controls;
  }

  getGroup(loadTable?) {
    this.groupSrv
      .fetchGroup()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: any) => {
        this.groupList = res;
        console.log(res, "res");
        this.dataTable.dataChangedObs.next(true);
        this.dataFilter.dataChangedObs.next(true);
      });
  }

  async getAllGroupsAsync() {
    try {
      this.groupList = await this.groupSrv.fetchGroup().toPromise();
      console.log(this.groupList, "groupList async");
    } catch (error) {
      this.toastr.error("Error retrieving groups!");
    } finally {
      this.dataTable.dataChangedObs.next(true);
      this.dataFilter.dataChangedObs.next(true);
    }
  }

  async getAllAgentsAsync() {
    try {
      let res = await this.ticketSrv.fetchAgent().toPromise();
      console.log(res, "res");
      this.dataSource.agent = res;
    } catch (error) {
      let msg = "Error fetching agents. Please try again!";
      msg = error.error.message ? error.error.message : msg;
      this.toastr.error(msg, "Agent Error");
      console.log(error, "agent error");
    }
  }

  async getAllCustomFiltersAsync() {
    try {
      let data = await this.groupSrv.getGroupCustomFilters().toPromise();
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
      await this.groupSrv.newGroupCustomFilter(data).toPromise();
      this.gs.sweetAlertSucess("Filter created successfully!");
    } catch (error) {
      let msg = "Error creating filter. Please try again!";
      msg = error.error.message ? error.error.message : msg;
      this.toastr.error(msg, "Filter Error");
      console.log(error, "filters error");
    }
  }

  async updateCustomFilterAsync(data: any) {
    try {
      await this.groupSrv.updateGroupCustomFilter(data).toPromise();
      this.gs.sweetAlertSucess("Filter updated successfully!");
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
        .getFilteredGroups(filter.noOfTickets, filter.noOfTicketsResolved)
        .toPromise();
      this.groupList = data;
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
      await this.groupSrv.deleteGroupCustomFilter(id).toPromise();
      this.gs.sweetAlertSucess("Filter deleted successfully!");
    } catch (error) {
      console.log(error, "filters error");
    }
  }

  addGroup() {
    const { valid, value } = this.addGroupForm;
    if (valid) {
      this.loading = true;
      this.groupSrv
        .createGroup(value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (res: any) => {
            this.loading = false;
            this.updateGroupId(res);
            //@ts-ignore
            document.querySelector("#ModalCenter6 .close").click();
            this.addGroupForm.reset();
            this.gs.sweetAlertSucess("Group Added Successfully");
            this.getGroup();
          },
          (err) => {
            this.loading = false;
            alert("Error occured try again");
          }
        );
    }
  }

  async renameGroup() {
    try {
      this.loader.rename = true;
      const payload = { groupName: this.groupName };
      let res = await this.groupSrv
        .editGroupName(payload, this.selectedGroup.groupID)
        .toPromise();
      console.log(res, "res");
      // @ts-ignore
      await document.querySelector("#RenameGroupModal .close").click();
      this.gs.sweetAlertSucess("Group Modified Successfully!");
    } catch (error) {
      this.toastr.error("Error occured try again");
    } finally {
      await this.getAllGroupsAsync();
      this.loader.rename = false;
    }
  }

  updateGroupId(result: { groupID: string; groupMembers: { id: number }[] }) {
    if (!this.gs.user.groupID) {
      if (result && result.groupID && result.groupMembers) {
        if (
          result.groupMembers.findIndex(
            (member) => member.id == this.gs.user.id
          ) >= 0
        ) {
          this.authSrv.updateUser({ groupID: result.groupID });
          console.log("groupId updated");
        }
      }
    }
  }

  selectGroup(group) {
    this.selectedGroup = group;
    this.groupName = group.groupName;
  }

  async addAgent() {
    if (this.agents.length) {
      const groupMembers = this.agents.map((agent) => ({ agentID: agent.id }));
      const payload = {
        groupID: this.selectedGroup.groupID,
        agents: groupMembers,
      };
      this.agentLoading = true;
      this.groupSrv
        .addGroupMember(payload)
        .subscribe(
          async () => {
            const agents = groupMembers.map((mem) => ({ id: mem.agentID }));
            this.updateGroupId({
              groupID: payload.groupID,
              groupMembers: agents,
            });
            await this.getAllGroupsAsync();
            this.gs.sweetAlertSucess("Agent Added to Group");
          },
          (err) => {
            this.gs.sweetAlertError(this.gs.getErrMsg(err));
          }
        )
        .add(() => {
          $(".close").click();
          this.agentLoading = false;
        });
    }
    console.log(this.agents);
  }

  onNameExist(input) {
    console.log(input, "input");
    if (input === this.selectedGroup.groupName) {
      return (this.nameExist = false);
    }

    const name = input;
    this.nameExist = Boolean(
      this.groupList.find((item) => {
        return item.groupName === name;
      })
    );

    console.log(this.nameExist, "nameExist");
  }

  open(id) {
    this.router.navigate(["/ticket/group", id]);
  }

  async exportTable() {
    const exportName = "Notch Group List - " + Date.now();
    const columns: any = [
      { title: "Id", value: "id" },
      { title: "Group Name", value: "groupName" },
      { title: "No of Members", value: "noOfTeamMembers" },
      { title: "No of Tickets", value: "noOfTickets" },
      { title: "Ticket Resolved", value: "noOfTicketsResolved" },
    ];

    // const groupList: any = await this.groupSrv.fetchGroup().toPromise();

    const groupList = this.groupList;
    console.log(groupList, "payload groupList");

    groupList.filter((d) => {
      if (d.groupName === undefined || d.groupName === null) d.groupName = "";
      return d;
    });

    exportTableToCSV(groupList, columns, exportName);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
