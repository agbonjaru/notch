import {
  Component,
  OnInit,
  ViewChild,
  Input,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { InvoiceService } from "src/app/services/invoice.service";
import { QuotationService } from "src/app/services/quotation.service";
import { SalesOrderService } from "src/app/services/sales-order.service";
import { DealsService } from "src/app/services/deals.service";
import { AMOUNTBYDATESPLITER } from "src/app/helpers/helperResources";
import { Chart } from "chart.js";

@Component({
  selector: "app-contact-dashboard",
  templateUrl: "./contact-dashboard.component.html",
  styleUrls: ["./contact-dashboard.component.css"],
})
export class ContactDashboardComponent implements OnInit, OnChanges {
  @Input() contactClientDetails;
  contactClientId;
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

  dashBoardCountResult = {
    invoice: {
      invoiceCount: 0,
      invoiceTotalAmount: 0,
    },
    quotation: {
      quotationCount: 0,
      quotationTotalAmount: 0,
    },
    deals: {
      dealsCount: 0,
      dealsTotalAmount: 0,
    },
    salesOrders: {
      salesOrdersCount: 0,
      salesOrdersTotalAmount: 0,
    },
  };

  barChartYear = 2020;

  constructor(
    private invoiceServ: InvoiceService,
    private quoteServ: QuotationService,
    private dealServ: DealsService,
    private salesOrderServ: SalesOrderService
  ) {}

  private sumUp(array, type?) {
    let initialValue = 0;
    if (type === "deals") {
      return array.reduce(function (accumulator, currentValue) {
        return accumulator + Number(currentValue.amount);
      }, initialValue);
    } else if (type == "salesorder") {
      return array.reduce(function (accumulator, currentValue) {
        return accumulator + Number(currentValue.totalAmount);
      }, initialValue);
    } else {
      return array.reduce(function (accumulator, currentValue) {
        return accumulator + Number(currentValue.totalCost);
      }, initialValue);
    }
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

  private fetchInvoices(clientID) {
    const query = `clientId=${clientID}&${this.getDateFilterRange}`;
    this.invoiceServ.getInvoiceByFilter(query).subscribe(
      (res: any) => {
        const { success, payload } = res;
        console.log(payload, "invoices");
        if (success && payload.length > 0) {
          this.dashBoardCountResult.invoice.invoiceCount = 0;
          this.dashBoardCountResult.invoice.invoiceTotalAmount = 0;

          this.dashBoardCountResult.invoice.invoiceCount = payload.length;
          this.dashBoardCountResult.invoice.invoiceTotalAmount = this.sumUp(
            payload
          );

          const response = AMOUNTBYDATESPLITER(payload, 0);
          // console.log(response, "dateResponse");
          this.myChartData.data.datasets[0].data = response;
          // console.log(this.myChartData.data.datasets[0].data, "dataing");
          this.myChartData.update();
        } else {
          // console.log("wirkOlfus");

          this.myChartData.data.datasets[0].data = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];
          this.myChartData.update();
        }
      },
      (error) => {
        console.log(error, "error Invoice");
      }
    );
  }

  private fetchQuotation(clientID) {
    const query = `clientId=${clientID}&${this.getDateFilterRange}`;
    this.quoteServ.getInvoiceByQuotation(query).subscribe(
      (res: any) => {
        const { success, payload } = res;
        if (success && payload.length > 0) {
          // console.log(payload, "quotation");

          this.dashBoardCountResult.quotation.quotationCount = 0;
          this.dashBoardCountResult.quotation.quotationTotalAmount = 0;

          this.dashBoardCountResult.quotation.quotationCount = payload.length;
          this.dashBoardCountResult.quotation.quotationTotalAmount = this.sumUp(
            payload
          );

          const response = AMOUNTBYDATESPLITER(payload, 1);
          console.log(response, "dateResponseQuote");
          this.myChartData.data.datasets[1].data = response;
          // console.log(this.myChartData.data.datasets[1].data, "Quote");
          this.myChartData.update();
        } else {
          // console.log("wirk");
          this.myChartData.data.datasets[1].data = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];
          this.myChartData.update();
        }
      },
      (error) => {
        console.log(error, "error Quotation Pull");
      }
    );
  }

  private fetchDeals(id) {
    console.log(id, "ClientId");
    const client = {
      client: {
        id: Number(id),
      },
      type: "Client",
    };

    this.dealServ.fetchDeals(null, { client }).subscribe(
      (res: any) => {
        console.log(res, "response Deals");
        if (res && res.length > 0) {
          console.log(res, "response Deals");
          this.dashBoardCountResult.deals.dealsCount = 0;
          this.dashBoardCountResult.deals.dealsTotalAmount = 0;

          this.dashBoardCountResult.deals.dealsCount = res.length;
          this.dashBoardCountResult.deals.dealsTotalAmount = this.sumUp(
            res,
            "deals"
          );
          console.log(this.sumUp(res, "deals"), "totalDealsSum"); // logs 6

          const response = AMOUNTBYDATESPLITER(res, 2);
          console.log(response, "dateResponseDeals");
          this.myChartData.data.datasets[2].data = response;
          // console.log(this.myChartData.data.datasets[2].data, "data Deals");
          this.myChartData.update();
        }
      },
      (error) => {
        console.log(error, "error");
      }
    );
  }

  private fetchSalesOrder(id) {
    this.salesOrderServ.fetchClientSalesOrder(id).subscribe(
      (res: any) => {
        if (res && res.length > 0) {
          console.log(res, "response salesOrder");
          this.dashBoardCountResult.salesOrders.salesOrdersCount = 0;
          this.dashBoardCountResult.salesOrders.salesOrdersTotalAmount = 0;

          this.dashBoardCountResult.salesOrders.salesOrdersCount = res.length;
          this.dashBoardCountResult.salesOrders.salesOrdersTotalAmount = this.sumUp(
            res,
            "salesorder"
          );
          console.log(this.sumUp(res, "salesorder"), "salesorder"); // logs 6

          const response = AMOUNTBYDATESPLITER(res, 3);
          console.log(response, "dateResponsesalesorder");
          this.myChartData.data.datasets[3].data = response;
          // console.log(this.myChartData.data.datasets[2].data, "data Deals");
          this.myChartData.update();
        }
      },
      (error) => {
        console.log(error, "error");
      }
    );
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
            label: "Invoice",
            backgroundColor: "#3e95cd",
            data: this.data[0],
          },
          {
            label: "Quotation",
            backgroundColor: "#1CAF9A",
            data: this.data[1],
          },
          {
            label: "Deals",
            backgroundColor: "#DC3545",
            data: this.data[1],
          },
          {
            label: "Sales Order",
            backgroundColor: "#0866C6",
            data: this.data[1],
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Invoice, Quotation, Deals and Sales Order",
        },
      },
    });
  }

  async ngOnChanges(changes: SimpleChanges) {
    // Fetch Dashboard Data
    const {
      contactClientDetails: { currentValue },
    } = changes;
    if (currentValue) {
      const { clientId } = currentValue;
      this.contactClientId = clientId;
      this.fetchInvoices(clientId);
      this.fetchQuotation(clientId);
      this.fetchDeals(clientId);
      this.fetchSalesOrder(clientId);
    }
  }

  handleSubmitChartDates() {
    this.fetchInvoices(this.contactClientId);
    this.fetchQuotation(this.contactClientId);
    // this.fetchInvoices(this.contactClientId);
  }
}
