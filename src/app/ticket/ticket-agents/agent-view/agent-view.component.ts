import { TicketModel } from "./../../../models/ticket/ticket.model";
import { TicketService } from "./../../../services/ticket/ticket.service";
import { UserModel } from "./../../../store/storeModels/user.model";
import { SalesPersonService } from "src/app/services/crew-services/sales-person.service";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import dropDownToggle from "src/app/utils/dropdown";
import { EmailService } from 'src/app/services/integrations/email/email.service';

@Component({
  selector: "app-agent-view",
  templateUrl: "./agent-view.component.html",
  styleUrls: ["./agent-view.component.css"],
})
export class AgentViewComponent implements OnInit {
  statData;
  id;
  agentDetail: UserModel;
  ticketList: TicketModel[];
  constructor(
    private route: ActivatedRoute,
    private spSrv: SalesPersonService,
    private ticketSrv: TicketService,
    private emailSrv: EmailService,
  ) {
    this.id = this.route.snapshot.paramMap.get("id");
    this.statData = { id: this.id, type: 1 };
  }

  ngOnInit() {
    this.getAgentDetail();
  }

  toggleClass(className: string, dropdownClass?) {
    dropDownToggle(className, dropdownClass);
    if (className === "about-agent") {
      this.getAgentDetail();
    }
    if (className === "ticket-list") {
      this.getTickets();
    }
  }

  getAgentDetail() {
    if (!this.agentDetail) {
      this.spSrv.fecthUser(this.id).subscribe((res: UserModel) => {
        this.agentDetail = res;
      });
    }
  }

  
  getTickets() {
    if (!this.ticketList) {
      this.ticketSrv.fetchTicket(this.statData).subscribe((res: any[]) => {
        this.ticketList = res;
      });
    }
  }
}
