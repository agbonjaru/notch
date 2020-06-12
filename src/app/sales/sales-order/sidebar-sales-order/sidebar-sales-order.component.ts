import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgForm, FormGroup, Validators, FormControl } from "@angular/forms";
import { ClientService } from "src/app/services/client-services/clients.service";
import { SalesPersonService } from "src/app/services/crew-services/sales-person.service";
import { GeneralService } from "src/app/services/general.service";
import { SalesOrderService } from "src/app/services/sales-order.service";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import { selectConfig } from "src/app/utils/utils";

import { SalesOrderFilterComponent } from "./sales-order-filter/sales-order-filter.component";

@Component({
  selector: "app-sidebar-sales-order",
  templateUrl: "./sidebar-sales-order.component.html",
  styleUrls: ["./sidebar-sales-order.component.css"],
})
export class SidebarSalesOrderComponent implements OnInit {
  @Output() getFilter = new EventEmitter();
  @Output() getCustomFilter = new EventEmitter();
  @ViewChild(SalesOrderFilterComponent)
  salesorderFilter: SalesOrderFilterComponent;
  @ViewChild("createdForm") createdForm: NgForm;
  @ViewChild("valueForm") valueForm: NgForm;
  @ViewChild("filterX") filterX: NgForm;

  teamMemberList$ = this.salespersonSrv.fetchAllSalePersons();
  clientList$ = this.clientSrv.getAllClients();
  teamList$ = this.signupSrv.fetchsalesPersonTeams();
  filterList$ = this.salesorderSrv.fetchFilter();
  ownerCnfig = { ...selectConfig };
  clientConfig = { ...selectConfig };

  creator;
  client;
  createLoading = false;

  createFilterForm = new FormGroup({
    name: new FormControl("", Validators.required),
    creator: new FormControl(""),
    status: new FormControl(""),
    fromAmount: new FormControl(""),
    toAmount: new FormControl(""),
    client: new FormControl(""),
    teamID: new FormControl(""),
  });

  showFilter = null;

  constructor(
    private salespersonSrv: SalesPersonService,
    private clientSrv: ClientService,
    private signupSrv: SignupLoginService,
    private salesorderSrv: SalesOrderService,
    private gs: GeneralService
  ) {}

  ngOnInit() {}

  toggle(type) {
    console.log(type);
  }

  clearFilter() {
    const resetForm = [
      this.createdForm,
      this.valueForm,
      this.valueForm,
      this.createFilterForm,
    ];
    this.creator = "";
    this.client = "";
    resetForm.forEach((form) => form.reset());

    this.getFilter.emit();
  }

  OwnerFiter() {
    if (this.creator) {
      this.getFilter.emit({ creatorID: this.creator.id });
    }
  }

  clientFilter() {
    if (this.client) {
      this.getFilter.emit({ value: this.client.id, type: 1 });
    }
  }

  statusFilter(value) {
    console.log(value, "valuesing");
    this.getFilter.emit({ status: value });
  }

  createdOnFilter = (date) => {
    date.startDate = new Date(Date.parse(date.startDate)).setHours(0, 0, 0, 0);
    date.endDate = new Date(Date.parse(date.endDate)).setHours(23, 59, 59, 59);
    this.getFilter.emit(date);
  };

  ValueFilter = (value) => this.getFilter.emit(value);

  get disCustomFilterBtn(): boolean {
    const {
      name,
      creator,
      fromAmount,
      toAmount,
      client,
      teamID,
      status,
    } = this.createFilterForm.value;
    const required = name;
    const notRequired =
      creator || status || fromAmount || toAmount || client || teamID;
    if (required && notRequired) {
      return true;
    } else {
      return false;
    }
  }

  createFilter() {
    this.createLoading = true;
    this.salesorderSrv.createFilter(this.createFilterForm.value).subscribe(
      (res: any) => {
        this.createLoading = false;
        this.filterList$ = this.salesorderSrv.fetchFilter();
        this.createFilterForm.reset();
        this.gs.sweetAlertSucess(res.message);
      },
      (error) => {
        this.createLoading = false;
        this.gs.sweetAlertError(this.gs.getErrMsg(error));
      }
    );
  }

  customFilter(id) {
    this.getCustomFilter.emit(id);
  }

  activateEdit(index) {
    document.getElementById(`collapseHead-${index}`).click();
  }

  editFilter(index) {
    this.showFilter = index;
  }

  cancelFiter(index) {
    this.showFilter = !index;
  }

  getEditFilter(data) {
    this.salesorderFilter.editLoading = true;
    this.salesorderSrv.editFilter(data).subscribe(
      (res: any) => {
        this.cancelFiter(0);
        this.salesorderFilter.editLoading = false;
        this.filterList$ = this.salesorderSrv.fetchFilter();
        this.gs.sweetAlertSucess(res.message);
      },
      (error) => {
        this.salesorderFilter.editLoading = false;
        this.gs.sweetAlertError(this.gs.getErrMsg(error));
      }
    );
  }

  deleteFilter(filter) {
    this.gs.sweetAlertFileDeletions(`${filter.name} Filter`).then((res) => {
      if (res.value) {
        this.salesorderSrv.deleteFilter(filter.id).subscribe(
          (res: any) => {
            this.filterList$ = this.salesorderSrv.fetchFilter();
            this.gs.sweetAlertSucess(res.message);
          },
          (error) => {
            this.gs.sweetAlertError(this.gs.getErrMsg(error));
          }
        );
      }
    });
  }
}
