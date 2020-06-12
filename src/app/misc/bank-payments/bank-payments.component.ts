import { Component, OnInit } from '@angular/core';
import { BankPaymentsService } from 'src/app/services/misc/bank-payments.service';
import { GeneralService } from 'src/app/services/general.service';
import { BankService } from 'src/app/services/settings-services/bank.service';
import { forkJoin, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bank-payments',
  templateUrl: './bank-payments.component.html',
  styleUrls: ['./bank-payments.component.css']
})
export class BankPaymentsComponent implements OnInit {
  /** LOADER */
  loading: boolean = false;

  /** */
  selected_account: string = '';
  bank_accounts: Array<any> = [];
  payment_records: any = [];

  /** DATATABLE CONFIG */
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      // { title: "checkbox", key: "checkbox" },
      // { title: "ID", key: "id" },
      { title: "Client", key: "client.name" },
      { title: "Invoice Number", key: "invoiceId" },
      { title: "Description", key: "description" },
      { title: "Amount Paid", key: "amountPaid" },
      { title: "Date", key: "createdOn" },
      // { title: "Action", key: "action" }
    ],
    options: {
      // bulkActions: [],
      // singleActions: ["View / Edit", "Assign To"]
    }
  };

  constructor(
    private route: ActivatedRoute,
    private bank_service: BankService,
    private bank_payment_service: BankPaymentsService,
    public general_service: GeneralService
  ) { }

  ngOnInit() {
    this.get_bank_accounts();

    this.route.params.subscribe( param => {
      if (this.general_service.checkIfObjectIsEmpty(param)) return;
      const { id } = param;
      this.get_account_payment_records(id);
    });
  }

  get_bank_accounts() {
    this.bank_service.fetch_bank_records().subscribe( (response : any) => {
      if (response.success) {
        this.bank_accounts = response.payload;
      }
    }, err => {
      console.log(`[Bank Payments Component] Get Organisation Banks Error: ${err.message}`);
    });
  }


  get_account_payment_records(id) {
    this.loading = true;
    this.bank_payment_service.filter_organisation_payments(`accountId=${7}`).subscribe( (response: any) => {
      this.loading = false;
      if (response.success) {
        this.payment_records = response.payload;
        this.dataTable.dataChangedObs.next(true);
      }
    }, err => {
      this.loading = false;
      console.log(`[Bank Payments Component] Get Organisation Payments Error: ${err.message}`);
    });
  }

  datatable_event_handler = data => {
    // switch (data.type) {
    //   case "singleaction":
    //     if (data.action === "View / Edit") {
    //       this.router.navigate(["/clients/leads/" + data.data.id]);
    //     }
        
    //     if (data.action === 'Assign To') {
    //       this.selected_lead = data.data;
    //       document.getElementById('show-assign-lead-btn').click();
    //     }
    //     // else if (data.action === "Delete") {
    //     //   this.deleteLead(data.data.id);
    //     // }

    //     break;

    //   default:
    //     break;
    // }
  };
}
