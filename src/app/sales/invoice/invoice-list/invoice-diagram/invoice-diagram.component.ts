import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { InvoiceService } from "src/app/services/invoice.service";
import { Chart } from "chart.js";
import { INVOICECHARTDATA } from "src/app/helpers/helperResources";
import { GeneralService } from "src/app/services/general.service";
import { CurrencyService } from "src/app/services/currency.service";
import { take } from "rxjs/operators";

@Component({
  selector: "app-invoice-diagram",
  templateUrl: "./invoice-diagram.component.html",
  styleUrls: ["./invoice-diagram.component.css"],
})
export class InvoiceDiagramComponent implements OnInit {
  @Output() getDashboardFilter = new EventEmitter();

  public canvas: any;
  public ctx;
  public myChartData;
  public chart_labels = [
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
  public datasets = [
    [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  ];
  public data = this.datasets[0];
  barChartYear = 2020;

  ViewSwitch = "List";
  dataSource: any;

  totalInvoice = {
    amount: 0,
    count: 0,
  };

  totalOverdues = {
    amount: 0,
    count: 0,
  };

  totalPayment = {
    amount: 0,
    count: 0,
  };

  totalUnpaid = {
    amount: 0,
    count: 0,
  };

  overdueList = [];
  baseCurrency = "";
  selectedTeamId = this.gs.teamIdSideBarFilter;
  teamID;

  constructor(
    private invoiceServ: InvoiceService,
    private gs: GeneralService,
    private currencyServ: CurrencyService
  ) {
    this.currencyServ.org_currencies.subscribe((org_currencies: any) => {
      this.baseCurrency = org_currencies.base_currency;
    });
    this.getAllInvoiceOverview();
  }

  private getAllInvoiceOverview() {
    this.selectedTeamId.subscribe((res) => {
      console.log(res, "team ID");
      this.teamID = res;
      const query = `${this.getDateFilterRange}&teamId=${res}`;
      this.invoiceServ
        .getInvoiceByFilter(query)
        .pipe(take(1))
        .subscribe(
          (res: any) => {
            if (res) {
              this.dataSource = res.payload;
              console.log(this.dataSource, "InvoicepayloadDash");
              let dataSourceInBaseCurr = this.dataSourceInBase(this.dataSource);

              // Set Dashboard Metrics
              this.handleTotalInvoiceAmount(dataSourceInBaseCurr);
              this.handleTotalPaidAmount(dataSourceInBaseCurr);
              this.handleTotalUnpaidAmount(dataSourceInBaseCurr);
              this.handleTotalOverDueAmount(dataSourceInBaseCurr);
              this.handleOverDueList(dataSourceInBaseCurr);

              //Chart Data
              const data = {
                totalInvoice: [],
                overdues: [],
                totalPayment: [],
                unpaid: [],
              };

              data.totalInvoice = INVOICECHARTDATA(
                dataSourceInBaseCurr,
                "totalInvoice"
              );
              data.totalPayment = INVOICECHARTDATA(
                dataSourceInBaseCurr,
                "paymentReceived"
              );
              data.unpaid = INVOICECHARTDATA(dataSourceInBaseCurr, "unpaid");
              data.overdues = INVOICECHARTDATA(
                dataSourceInBaseCurr,
                "overdues"
              );

              // console.log(data, "datHerer");

              this.myChartData.data.datasets[0].data = data.totalInvoice;
              this.myChartData.data.datasets[1].data = data.totalPayment;
              this.myChartData.data.datasets[2].data = data.unpaid;
              this.myChartData.data.datasets[3].data = data.overdues;
              // console.log(this.myChartData.data.datasets[0].data, "dataing");
              this.myChartData.update();
            } else {
              this.myChartData.data.datasets = [
                [
                  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                ],
              ];
              this.myChartData.update();
            }
          },
          (error) => {
            console.log(error, "error");
          }
        );
    });
  }

  private get getDateFilterRange() {
    const startYr = Date.parse(
      new Date(`01-01-${this.barChartYear}`).toISOString()
    );
    const endYr = Date.parse(
      new Date(`12-31-${this.barChartYear}`).toISOString()
    );
    const jsonValueRange = {
      createdOn: { from: startYr, to: endYr },
    };
    return `range=${JSON.stringify(jsonValueRange)}`;
  }

  ngOnInit() {
    // Prep Dashboard HTML View
    this.canvas = document.getElementById("CountryChart");
    this.ctx = this.canvas.getContext("2d");

    this.myChartData = new Chart(this.ctx, {
      type: "bar",
      data: {
        labels: this.chart_labels,

        datasets: [
          {
            label: "Total Invoice",
            backgroundColor: "#0866C6",
            data: this.data[0],
          },
          {
            label: "Payment Received",
            backgroundColor: "#6f42c1",
            data: this.data[1],
          },
          {
            label: "Unpaid Invoice",
            backgroundColor: "#1CAF9A",
            data: this.data[1],
          },
          {
            label: "Overdues",
            backgroundColor: "#DC3545",
            data: this.data[1],
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Total Invoice, Payment Received, Unpaid Invoice, and Overdues",
        },
        scales: {
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: `Value in Base Currency`,
              },
            },
          ],
        }, //END scales
      },
    });
  }

  handleViewSwitch(view) {
    view === "List" ? (this.ViewSwitch = "List") : (this.ViewSwitch = "Bar");
  }

  handleTotalInvoiceAmount(arr) {
    this.totalInvoice.count = arr.length;
    arr.forEach((currentValue: any) => {
      const { totalCost } = currentValue;
      this.totalInvoice.amount += totalCost;
    });
  }

  handleTotalPaidAmount(arr) {
    for (const item of arr) {
      const { paymentHistory } = item;
      if (paymentHistory.length > 0) {
        this.totalPayment.count++;
        paymentHistory.forEach((currentValue: any) => {
          const { amountPaid } = currentValue;
          this.totalPayment.amount += amountPaid;
        });
      }
    }
  }

  handleTotalUnpaidAmount(arr) {
    for (const item of arr) {
      const { balanceDue } = item;
      if (balanceDue !== 0) {
        this.totalUnpaid.count++;
        this.totalUnpaid.amount += balanceDue;
      }
    }
  }

  handleTotalOverDueAmount(arr) {
    const today = Date.parse(new Date().toISOString());
    arr.forEach((currentValue) => {
      const { paymentDueDate, balanceDue } = currentValue;
      if (today > paymentDueDate && balanceDue > 0) {
        this.totalOverdues.count++;
        this.totalOverdues.amount += balanceDue;
      }
    });
  }

  handleOverDueList(arr) {
    const today = Date.parse(new Date().toISOString());
    this.overdueList = arr.filter(
      (res) => today > res.paymentDueDate && res.balanceDue > 0
    );
  }

  dashboardListFilter(filter) {
    this.getDashboardFilter.emit(filter);
    this.gs.teamIdSideBarFilter.next(this.teamID);
  }

  handleSubmitChartDates() {
    this.getAllInvoiceOverview();
  }

  private dataSourceInBase(arr) {
    let newArr = arr.map((item: any) => {
      const { currency, paymentHistory } = item;
      let rate = this.currencyServ.get_conversion_rate(currency);
      // console.log(rate, "rates");
      item.totalCost = item.totalCost / rate;
      item.balanceDue = item.balanceDue / rate;
      if (paymentHistory.length > 0) {
        item.paymentHistory = paymentHistory.map((res: any) => {
          res.amountPaid = res.amountPaid / rate;
          return res;
        });
      }
      return item;
    });
    return newArr;
  }
}
