import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { selectConfig } from "src/app/utils/utils";
import { SalesPersonService } from "src/app/services/crew-services/sales-person.service";
import { ClientService } from "src/app/services/client-services/clients.service";

@Component({
  selector: "app-sales-order-filter",
  templateUrl: "./sales-order-filter.component.html",
  styleUrls: ["./sales-order-filter.component.css"],
})
export class SalesOrderFilterComponent implements OnInit {
  @Input() filterData;
  @Input() filterIndex;
  @Output() cancelFiter = new EventEmitter();
  @Output() getEditFilter = new EventEmitter();
  filterForm = {
    name: null,
    creator: null,
    fromAmount: null,
    toAmount: null,
    client: null,
    teamID: "",
    status: "",
  };
  ownerCnfig = { ...selectConfig, displayKey: "creatorName" };
  clientConfig = { ...selectConfig, displayKey: "clientName" };
  editLoading = false;
  teamMemberList$ = this.salespersonSrv.fetchAllSalePersons();
  teamMemberList: any[];
  clientList$ = this.clientSrv.getAllClients();
  constructor(
    private salespersonSrv: SalesPersonService,
    private clientSrv: ClientService
  ) {}

  ngOnInit() {
    this.filterForm = this.filterData;
    console.log(this.filterForm, "this.filterForm");
    this.filterForm.client = {
      clientID: this.filterData.clientID,
      clientName: this.filterData.clientName,
    };
    this.filterForm.creator = {
      creatorID: this.filterData.creatorID,
      creatorName: this.filterData.creatorName,
    };
  }

  cancel() {
    this.cancelFiter.emit(this.filterIndex);
  }

  editFilter() {
    this.getEditFilter.emit({ ...this.filterForm });
  }

  formatClient(data: any[]) {
    return data.map((client) => ({
      clientID: client.id,
      clientName: client.name,
    }));
  }

  formatOwner(data: any[]) {
    return data.map((owner) => ({
      creatorID: owner.id,
      creatorName: owner.name,
    }));
  }
}
