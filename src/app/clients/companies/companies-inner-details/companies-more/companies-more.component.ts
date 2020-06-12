import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import * as $ from "jquery";
import { InvoiceService } from "src/app/services/invoice.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { QuotationService } from "src/app/services/quotation.service";
import { GeneralService } from "src/app/services/general.service";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { SalesOrderService } from "src/app/services/sales-order.service";

@Component({
  selector: "app-companies-more",
  templateUrl: "./companies-more.component.html",
  styleUrls: ["./companies-more.component.css"]
})
export class CompaniesMoreComponent implements OnInit, OnChanges {
  @Input() selectedSection;
  @Input() companyClientId;
  companyId;
  dataSources;

  constructor(
    private companyServ: CompaniesService,
    private genSer: GeneralService,
    private invoiceServ: InvoiceService,
    private quoteServ: QuotationService,
    private activeRoute: ActivatedRoute,
    private salesOrderServ: SalesOrderService,
    private router: Router
  ) {
    this.activeRoute.params.subscribe((par: Params) => {
      const { id } = par;
      this.companyId = id;
    });
  }

  private handleGetInvoices(id) {
    // const query = `clientId=${Number(id)}`;
    this.genSer.filterQueryClientIDs.subscribe(queries => {
      const query = `clientId=${queries}`;
      console.log(query, "queries invoice");
      this.invoiceServ.getInvoiceByFilter(query).subscribe(
        (res: any) => {
          if (res) {
            this.dataSources = res.payload;
            console.log(this.dataSources, "Invoicepayload");
          }
        },
        error => {
          console.log(error, "error");
        }
      );
    });
  }

  private handleGetQuote(id) {
    // const query = `clientId=${id}`;
    this.genSer.filterQueryClientIDs.subscribe(queries => {
      const query = `clientId=${queries}`;
      // console.log(query, 'queriesQuotation');
      this.quoteServ.getInvoiceByQuotation(query).subscribe(
        (res: any) => {
          if (res) {
            this.dataSources = res.payload;
            console.log(this.dataSources, "quotePayload");
          }
        },
        error => {
          console.log(error, "error");
        }
      );
    });
  }

  private handleGetContacts() {
    this.companyServ.getContactForCompany(this.companyClientId).subscribe(
      (res: any) => {
        if (res) {
          this.dataSources = res.payload;
          // console.log(res, 'contact', this.companyClientId);
        }
      },
      error => {
        console.log(error, "error");
      }
    );
  }

  private handleGetSalesOrder(id) {
    this.salesOrderServ
      .fetchClientSalesOrder(id)
      .subscribe(
        (res: any) => {
          this.dataSources = res;
          console.log(res, id, "salesOrder");
        },
        error => {
          console.log(error, "error");
        }
      );
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    const {
      selectedSection: { currentValue: selectionValue }
    } = changes;
    if (selectionValue !== undefined) {
      // console.log(changes, 'value');
      this.handlePageNavigation(selectionValue);
      switch (selectionValue) {
        case "#invoice-tab":
          this.getInvoices();
          break;
        case "#quotes-tab":
          this.getQuotes();
          break;
        case "#contacts-tab":
          this.getContacts();
          break;
        case "#salesorder-tab":
          this.getSalesOrder();
          break;

        default:
          break;
      }
    }
  }

  getContacts() {
    this.handleGetContacts();
  }

  getInvoices() {
    this.handleGetInvoices(this.companyClientId);
  }

  getQuotes() {
    this.handleGetQuote(this.companyClientId);
  }

  getSalesOrder() {
    this.handleGetSalesOrder(this.companyClientId);
  }

  handlePageNavigation(selectionValue) {
    $("html, body").animate(
      {
        scrollTop: $(selectionValue).offset().top
      },
      1000
    );
    const showDivId = selectionValue.substr(0, selectionValue.indexOf("-"));
    $(".moreNav").removeClass("active");
    $(selectionValue).addClass("active");

    $(".morePanel").removeClass("active show");
    $(showDivId).addClass("active show");
  }

  navigateRouter(salesOrder) {
    this.router.navigate(["/sales/create-sales-order"], {
      queryParams: { salesOrder: salesOrder.code }
    });
  }
}
