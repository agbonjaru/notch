import { Router } from '@angular/router';
import { DealModel } from 'src/app/models/deal.model';
import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-deals-list-table',
  templateUrl: './deals-list-table.component.html',
  styleUrls: ['./deals-list-table.component.css']
})
export class DealsListTableComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      // { title: "checkbox", key: "checkbox" },
      // { title: "Deal code", key: "displayCode" },
      { title: "Deal Name", key: "name" },
      { title: "Deal Owner", key: "source", },
      { title: "Deal Client", key: "clientName", },
      { title: "Amount", key: "amount", pipe: 'currency'},
      { title: "Stage", key: "currStage", },
      { title: "Created Date", key: "createdDate", pipe: 'date' },
      { title: "Close Date", key: "closeDate", pipe: 'date' },
   
      
      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},
      singleActions: ["View/Edit"],
      bulkActions: [    
 
      ]
    }
  };
  @Input() dealList: DealModel

  constructor(private router: Router) { }
  
  dataFeedBackObsListener = data => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
      if (data.action === "View/Edit") {
          this.router.navigate(['/sales/deals-view/'+ data.data.code]);
        } 
        break;

      default:
        break;
    }
  };
  ngOnInit() {}


}
