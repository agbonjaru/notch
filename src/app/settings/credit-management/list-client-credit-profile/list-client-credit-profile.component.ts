import { Component, OnInit } from "@angular/core";
import { CreditMgtService } from "src/app/services/settings-services/credit-mgt.service";
import { ActivatedRoute, Router } from "@angular/router";
import { selectConfig } from "src/app/utils/utils";
import { ClientService } from "src/app/services/client-services/clients.service";
import { Observable, BehaviorSubject } from "rxjs";
import { GeneralService } from "src/app/services/general.service";
import $ from "jquery";
@Component({
  selector: "app-list-client-credit-profile",
  templateUrl: "./list-client-credit-profile.component.html",
  styleUrls: ["./list-client-credit-profile.component.css"],
})
export class ListClientCreditProfileComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "Index", key: "index" },
      { title: "Client Code", key: "clientCode", isEmpty: "No Code" },
      { title: "Client Name", key: "clientName", isEmpty: "No Code" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: ["View invoice", "Delete"],
      bulkActions: [],
    },
  };
  profile = { id: "", name: "" };
  profileClients: any[];
  config = { ...selectConfig };
  clientList$: Observable<any>;
  selectedClients: any;
  loading = false;
  constructor(
    private creditMgtSrv: CreditMgtService,
    private clientSrv: ClientService,
    private router: Router,
    private gs: GeneralService,
    route: ActivatedRoute
  ) {
    route.params.subscribe((param: any) => {
      this.profile = param;
    });
    this.clientList$ = this.clientSrv.getAllClients();
  }

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        if (data.action === "View invoice") {
          this.viewInvoice(data.data.clientCode);
        } else if (data.action === "Delete") {
          this.deleteClient(data.data);
        }
        break;
      default:
        break;
    }
  };

  ngOnInit() {
    this.getProfileClient();
  }

  getProfileClient() {
    this.creditMgtSrv
      .fetchProfileClients(this.profile.id)
      .subscribe((res: any) => {
        this.profileClients = res;
      });
  }

  deleteClient({ id, clientName }) {
    this.gs.sweetAlertFileDeletions(clientName).then((res) => {
      if (res.value) {
        this.creditMgtSrv.deleteProfileClient(id).subscribe(
          (res: any) => {
            this.getProfileClient();
            this.dataTable.dataChangedObs.next(true);
            this.gs.sweetAlertSucess(res.message);
          },
          (err) => {
            this.gs.sweetAlertError(this.gs.getErrMsg(err));
          }
        );
      }
    });
  }

  saveClients() {
    if (this.selectedClients) {
      this.loading = true;
      const clients = [
        {
          clientCode: this.selectedClients.id,
          clientName: this.selectedClients.name,
        },
      ];
      const payload = { clientsDTO: [...clients], name: this.profile.name };
      this.creditMgtSrv
        .attactClientToProfile(payload)
        .subscribe(
          (res: any) => {
            this.getProfileClient();
            this.dataTable.dataChangedObs.next(true);
            this.gs.sweetAlertSucess(res.message);
            // Reset
            this.selectedClients = undefined;
          },
          (err) => {
            this.gs.sweetAlertError(this.gs.getErrMsg(err));
          }
        )
        .add(() => {
          $(".close").click();
          this.loading = false;
        });
    }
  }

  viewInvoice(id) {
    this.router.navigate(["/sales/invoice-list"], {
      queryParams: { session_id: "List", clientId: id },
    });
  }
}
