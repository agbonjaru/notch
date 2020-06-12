import {
  Component,
  OnInit,
  SimpleChanges,
  Input,
  OnChanges
} from "@angular/core";
import * as $ from "jquery";
import { InvoiceService } from "src/app/services/invoice.service";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { GeneralService } from "src/app/services/general.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { QuotationService } from "src/app/services/quotation.service";
import { SalesOrderService } from "src/app/services/sales-order.service";

@Component({
  selector: "app-contacts-more",
  templateUrl: "./contacts-more.component.html",
  styleUrls: ["./contacts-more.component.css"]
})
export class ContactsMoreComponent implements OnInit, OnChanges {
  @Input() selectedSection;
  @Input() contactClientId;
  dataSources;
  contactId;

  constructor(
    private contactServ: ContactsService,
    private genSer: GeneralService,
    private invoiceServ: InvoiceService,
    private quoteServ: QuotationService,
    private activeRoute: ActivatedRoute,
    private salesOrderServ: SalesOrderService,
    private router: Router
  ) {
    this.activeRoute.params.subscribe((par: Params) => {
      const { id } = par;
      this.contactId = id;
    });
  }
  ngOnInit() {}

  private handleGetInvoices(id) {
    const query = `clientId=${Number(id)}`;
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
  }

  private handleGetQuote(id) {
    const query = `clientId=${id}`;
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
  }

  private handleGetSalesOrder(id) {
    this.salesOrderServ.fetchClientSalesOrder(id).subscribe(
      (res: any) => {
        // console.log(res, id, 'salesOrder');
        if (res) {
          this.dataSources = res;
        }
      },
      error => {
        console.log(error, "error");
      }
    );
  }

  private handleGetCompanies() {
    this.contactServ.getCompanyForContact(this.contactClientId).subscribe(
      (res: any) => {
        if (res) {
          this.dataSources = res.payload;
          console.log(res, "companies", this.contactClientId);
        }
      },
      error => {
        console.log(error, "error");
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes, 'changes');
    const {
      selectedSection: { currentValue: selectionValue }
    } = changes;
    if (selectionValue) {
      this.handlePageNavigation(selectionValue);
      switch (selectionValue) {
        case "#invoice-tab":
          this.getInvoices();
          break;
        case "#quotes-tab":
          this.getQuotes();
          break;
        case "#companies-tab":
          this.getCompanies();
          break;
        case "#salesorder-tab":
          this.getSalesOrder();
          break;

        default:
          break;
      }
    }
  }

  getCompanies() {
    this.handleGetCompanies();
  }

  getInvoices() {
    this.handleGetInvoices(this.contactClientId);
  }

  getQuotes() {
    this.handleGetQuote(this.contactClientId);
  }

  getSalesOrder() {
    this.handleGetSalesOrder(this.contactClientId);
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
