import { FormGroup, FormBuilder, FormArray, ValidatorFn } from "@angular/forms";
import { GeneralService } from "src/app/services/general.service";
import { InvoiceService } from "src/app/services/invoice.service";
import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";

@Component({
  selector: "app-invoice-quotation",
  templateUrl: "./invoice-quotation.component.html",
  styleUrls: ["./invoice-quotation.component.css"],
})
export class InvoiceQuotationComponent implements OnInit {
  btnLoading = false;
  arrayTemplates: any = {};
  singleTemplate: any = [];
  templatePayload: any = {
    id: 0,
    invoiceTemplateId: 0,
    quotationTemplateId: 0,
  };

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private gs: GeneralService
  ) {
    $.getScript("../../../assets/js/datatableScript.js");
  }

  ngOnInit() {
    this.getAllTemplates();
  }

  getAllTemplates() {
    this.invoiceService.getAllTemplates().subscribe((res: any) => {
      const { payload, success } = res;
      this.arrayTemplates = payload;
      // console.log(res, "res");

      // return;
      if (success) {
        this.templatePayload.id = res.payload[0].id;
        this.templatePayload.invoiceTemplateId =
          res.payload[0].invoiceTemplateId;
        this.templatePayload.quotationTemplateId =
          res.payload[0].quotationTemplateId;
      }
      // console.log(this.templatePayload, "templatePayload");
    });
  }

  getClientTemplate(clientId) {
    this.invoiceService.getClientTemplate(clientId).subscribe((payload) => {
      this.singleTemplate = payload;
      console.log(payload, "singleTemplate");
    });
  }

  onSubmitInvoice() {
    const payload = {
      id: this.templatePayload.id,
      invoiceTemplateId: this.templatePayload.invoiceTemplateId,
    };

    // console.log(payload.id, "temppayloadId");

    if (payload.id === 0 || payload.id === null) {
      this.applyInvoice(payload);
      return;
    } else if (payload.id > 0) {
      this.updateInvoice(payload);
      return;
    }
  }

  applyInvoice(payload) {
    this.btnLoading = true;
    if (this.templatePayload.invoiceTemplateId === null) return;

    this.invoiceService
      .createTemplate(payload)
      .subscribe(
        (res) => {
          this.gs.sweetAlertSucess("Template Updated");
        },
        (err) => {
          let errMsg = "sorry error occured try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.gs.sweetAlertError(errMsg);
        }
      )
      .add(() => {
        this.getAllTemplates();
        this.btnLoading = false;
      });
  }

  updateInvoice(payload) {
    this.btnLoading = true;
    if (this.templatePayload.invoiceTemplateId === null) return;

    this.invoiceService
      .updateTemplate(payload)
      .subscribe(
        (res) => {
          this.gs.sweetAlertSucess("Template Updated");
        },
        (err) => {
          let errMsg = "sorry error occured try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.gs.sweetAlertError(errMsg);
        }
      )
      .add(() => {
        this.getAllTemplates();
        this.btnLoading = false;
      });
  }

  onSubmitQuotation() {
    const payload = {
      id: this.templatePayload.id,
      quotationTemplateId: this.templatePayload.quotationTemplateId,
    };

    if (payload.id === 0 || payload.id === null) {
      this.applyQuotation(payload);
      return;
    } else if (payload.id > 0) {
      this.updateQuotation(payload);
      return;
    }
  }

  applyQuotation(payload) {
    this.btnLoading = true;
    if (this.templatePayload.quotationTemplateId === null) return;

    this.invoiceService
      .createTemplate(payload)
      .subscribe(
        (res) => {
          this.gs.sweetAlertSucess("Template Updated");
        },
        (err) => {
          let errMsg = "sorry error occured try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.gs.sweetAlertError(errMsg);
        }
      )
      .add(() => {
        this.getAllTemplates();
        this.btnLoading = false;
      });
  }

  updateQuotation(payload) {
    this.btnLoading = true;
    if (this.templatePayload.quotationTemplateId === null) return;

    this.invoiceService
      .updateTemplate(payload)
      .subscribe(
        (res) => {
          this.gs.sweetAlertSucess("Template Updated");
        },
        (err) => {
          let errMsg = "sorry error occured try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.gs.sweetAlertError(errMsg);
        }
      )
      .add(() => {
        this.getAllTemplates();
        this.btnLoading = false;
      });
  }
}
