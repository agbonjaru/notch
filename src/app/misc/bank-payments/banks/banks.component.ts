import { Component, OnInit } from '@angular/core';
import { BankService } from 'src/app/services/settings-services/bank.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.css']
})
export class BanksComponent implements OnInit {
  banks: any;

  
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      // { title: "checkbox", key: "checkbox" },
      // { title: "ID", key: "id" },
      { title: "Account Name ", key: "name" },
      { title: "Account Number", key: "number" },
      { title: "Bank", key: "bank" },
      { title: "Account Currency", key: "currency" },
      { title: "Account Balance", key: "balance" },
      // { title: "Date", key: "createdOn" },
      { title: "Action", key: "action" }
    ],
    options: {
      // bulkActions: [],
      singleActions: ["View"]
    }
  };

  constructor(
    private bank_service: BankService,
    private router: Router
  ) { }

  ngOnInit() {
    this.bank_service.fetch_bank_records().subscribe ( (response : any) => {
      if (response.success) {
        this.banks = [ ...response.payload ];
        this.dataTable.dataChangedObs.next(true);
        console.log(this.banks);
      }
    })
  }

  datatable_event_handler (event) {
    console.log(event);
    switch (event.action.toLowerCase()) {
      case 'view':
        this.router.navigate([`/banks/${event.data.id}`]);
        break;
      default:
    }
  }

}
