import { UserModel } from "../../../store/storeModels/user.model";
import { GroupService } from "../../../services/ticket/group.service";
import { TicketModel } from "../../../models/ticket/ticket.model";
import { TicketService } from "../../../services/ticket/ticket.service";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import dropDownToggle from "src/app/utils/dropdown";
import { GeneralService } from "src/app/services/general.service";

@Component({
  selector: "app-group-view",
  templateUrl: "./group-view.component.html",
  styleUrls: ["./group-view.component.css"],
})
export class GroupViewComponent implements OnInit {
  statData;
  id;
  ticketList: TicketModel[];
  groupDetail;

  constructor(
    private route: ActivatedRoute,
    private ticketSrv: TicketService,
    private groupSrv: GroupService,
    private gs: GeneralService
  ) {
    this.id = this.route.snapshot.paramMap.get("id");
    this.statData = { id: this.id, type: 2 };
  }

  async ngOnInit() {
    await this.getOneGroup();
  }

  toggleClass(className: string, dropdownClass?) {
    dropDownToggle(className, dropdownClass);
    if (className === "about-agent") {
      this.getOneGroup();
    }
    if (className === "ticket-list") {
      this.getTickets();
    }
  }

  async getOneGroup() {
    this.groupDetail = await this.groupSrv.fetchOneGroup(this.id).toPromise();
    console.log(this.groupDetail, "this.groupDetail");
  }

  getTickets() {
    if (!this.ticketList) {
      this.ticketSrv.fetchTicket(this.statData).subscribe((res: any[]) => {
        this.ticketList = res;
      });
    }
  }

  onDeleteAgent(agent) {
    this.gs.sweetAlertFileDeletions(agent.name).then((result) => {
      if (result.value) {
        this.deleteAgent(agent.agentID);
      }
    });
  }

  deleteAgent(agentID: number) {
    this.groupSrv.removeGroupMember(this.id, agentID).subscribe(
      () => {
        this.gs.sweetAlertSucess("Agent Deleted");
        this.getOneGroup();
      },
      (err) => {
        let errMsg = "sorry error occured try again";
        errMsg = err.error && err.error.message ? err.error.message : errMsg;
        this.gs.sweetAlertError(errMsg);
      }
    );
  }
}
