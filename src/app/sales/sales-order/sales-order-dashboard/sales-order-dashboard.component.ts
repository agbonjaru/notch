import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { SalesOrderModel } from "src/app/models/sales-order.model";
import { SalesOrderService } from "src/app/services/sales-order.service";
import { GeneralService } from "src/app/services/general.service";
import { getCurrencySymbol } from "src/app/utils/currency.util";
import { CurrencyService } from "src/app/services/currency.service";
import { NavigationExtras, Router } from "@angular/router";
import { take } from "rxjs/operators";
import { SALESORDERCHARTDATA } from "src/app/helpers/helperResources";

@Component({
  selector: "app-sales-order-dashboard",
  templateUrl: "./sales-order-dashboard.component.html",
  styleUrls: ["./sales-order-dashboard.component.css"],
})
export class SalesOrderDashboardComponent implements OnInit, OnChanges {
  @Input() salesOrderList: SalesOrderModel[];
  @Output() getFilter = new EventEmitter();
  @Input() teamId;
  selectedYear = new Date().getFullYear();
  salesOrderStats = {
    totalAmount: 0,
    approved: 0,
    declined: 0,
    totalNumber: 0,
  };
  showGraph = false;
  public chartLabel = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  public chartLegend = true;
  public chartData = [
    {
      data: [40, 30, 10, 50, 60, 40, 50],
      label: "Total",
      backgroundColor: "rgb(6,102,198, 0.7)",
      hoverBackgroundColor: "rgb(6,102,198, 0.7)",
      hoverBorderColor: "rgb(6,102,198, 0.7)",
    },
    {
      data: [40, 40, 30, 70, 80, 10, 30],
      label: "Approved",
      backgroundColor: "rgb(75,176,154, 0.8)",
      hoverBackgroundColor: "rgb(75,176,154, 0.8)",
      hoverBorderColor: "rgb(75,176,154, 0.8)",
    },
    {
      data: [40, 30, 20, 80, 50, 30, 10],
      label: "Declined",
      backgroundColor: "rgb(221,68,69,0.6)",
      hoverBackgroundColor: "rgb(221,68,69,0.6)",
      hoverBorderColor: "rgb(221,68,69,0.6)",
    },
    {
      data: [40, 30, 20, 80, 50, 30, 10],
      label: "Open",
      backgroundColor: "#ffbb33",
      hoverBackgroundColor: "#ffbb33",
      hoverBorderColor: "#ffbb33",
    },
  ];
  currencySymbol;
  public options = {
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: `Amount in Base Currency `,
          },
        },
      ],
    }, //END scales
  };
  chartSalesOrder = [];
  constructor(
    private salesorderSrv: SalesOrderService,
    private currencySrv: CurrencyService,
    private gs: GeneralService,
    private router: Router
  ) {
    this.teamId = this.gs.user.teamID;
  }

  ngOnInit() {
    this.currencySrv.org_currencies.subscribe((org_currencies) => {
      if (!this.gs.checkIfObjectIsEmpty(org_currencies)) {
        this.currencySymbol = org_currencies.base_currency;
        this.options.scales.yAxes[0].scaleLabel.labelString = `Amount in Base Currency (${this.currencySymbol})`;
      }
    });
  }

  private get getDateFilterRange() {
    const startDate = Date.parse(
      new Date(`01-01-${this.selectedYear}`).toISOString()
    );
    const endDate = Date.parse(
      new Date(`12-31-${this.selectedYear}`).toISOString()
    );
    return { startDate, endDate };
  }

  private dataSourceInBase(arr) {
    let newArr = arr.map((item: any) => {
      const { currency } = item;
      let rate = this.currencySrv.get_conversion_rate(currency);
      item.totalAmount = item.totalAmount / rate;
      return item;
    });
    return newArr;
  }

  private getSalesOrder(teamId) {
    this.showGraph = false;
    let filter = this.getDateFilterRange;
    this.salesorderSrv
      .fetchAllSalesOrder(teamId, filter)
      .pipe(take(1))
      .subscribe((data: any) => {
        let dataSourceInBaseCurr = this.dataSourceInBase(data);
        this.chartSalesOrder = dataSourceInBaseCurr;
        this.getGraph(dataSourceInBaseCurr);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    const {
      salesOrderList: { currentValue },
    } = changes;
    this.getSalesOrder(this.teamId);
    this.getStats(currentValue);
  }

  getStats(salesOrderList) {
    if (salesOrderList) {
      let { salesOrderStats } = this;
      salesOrderStats[
        "totalAmount"
      ] = this.currencySrv.get_total_converted_value(
        salesOrderList,
        "totalAmount"
      );
      salesOrderStats["approved"] = salesOrderList.filter(
        (sal) => sal.status === 2
      ).length;
      salesOrderStats["declined"] = salesOrderList.filter(
        (sal) => sal.status === 1
      ).length;
      salesOrderStats["totalNumber"] = salesOrderList.length;
    }
  }

  getGraph(salesOrderList) {
    const data = {
      totalSaleOrder: [],
      approved: [],
      declined: [],
      open: [],
    };

    data.totalSaleOrder = SALESORDERCHARTDATA(
      salesOrderList,
      "totalSalesOrder"
    );
    data.approved = SALESORDERCHARTDATA(salesOrderList, "totalApproved");
    data.declined = SALESORDERCHARTDATA(salesOrderList, "totalDeclined");
    data.open = SALESORDERCHARTDATA(salesOrderList, "totalOpen");

    this.chartData[0].data = data.totalSaleOrder;
    this.chartData[1].data = data.approved;
    this.chartData[2].data = data.declined;
    this.chartData[3].data = data.open;
    this.showGraph = true;
  }

  handleDashboardFiltertoList(filter) {
    this.getFilter.emit({ status: filter });
    const navigationExtras: NavigationExtras = {
      queryParams: { session_id: "List" },
    };
    this.router.navigate(["/sales/sales-order-list"], navigationExtras);
  }

  submitYear() {
    this.getSalesOrder(this.teamId);
  }
}
