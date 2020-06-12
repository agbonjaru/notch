import { CurrencyService } from 'src/app/services/currency.service';
import { ClientService } from "src/app/services/client-services/clients.service";
import { DocumentService } from "./../../../../services/document.service";
import { SalesOrderService } from "./../../../../services/sales-order.service";
import { GeneralService } from "src/app/services/general.service";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import dropDownToggle from "src/app/utils/dropdown";
import { DealModel } from "src/app/models/deal.model";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DealsService } from "src/app/services/deals.service";
import { dataList } from "src/app/data/industries";
import { selectConfig, comparer } from "src/app/utils/utils";
import { takeUntil } from "rxjs/operators";
import { Subject, Observable } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import FileExt from "src/app/utils/file-ext";
import { InvoiceService } from "src/app/services/invoice.service";
import { LibaryModel } from "src/app/shared/components/library-upload/library-upload.component";
import { QuotationService } from "src/app/services/quotation.service";
import { getCurrencySymbol } from "src/app/utils/currency.util";
import { ViewDocComponent } from "src/app/shared/components/view-doc/view-doc.component";
import * as filesize from 'filesize';
declare var $: any;

@Component({
  selector: "app-deal-nav",
  templateUrl: "./deal-nav.component.html",
  styleUrls: ["./deal-nav.component.css"],
})
export class DealNavComponent implements OnInit, OnDestroy {
  onlineViewer = "https://docs.google.com/gview?url=";
  fileExt = new FileExt();
  private unsubscribe = new Subject();
  tDate = new Date();
  @Input() deal: DealModel;
  @Output() getDeal = new EventEmitter();
  @Output() callDealStage = new EventEmitter();
  @ViewChild(ViewDocComponent) viewDoc: ViewDocComponent;
  clientList$ = this.clientSrv.getAllClients();
  storeFiles = {};
  documentList = [];
  stageList: any[];
  currencyList;
  invoiceList: any[];
  quotationList$: Observable<{ success: boolean; payload: [] }>;
  salesorderList: any[];
  requiredDocument;
  loading;
  fileDetail;
  ContactConfig = { ...selectConfig, placeholder: "Choose Contact" };
  clientConfig = { ...selectConfig, placeholder: "Choose Client" };

  editMode = false;
  date = new Date();
  updateDealForm = new FormGroup({
    clientName: new FormControl("", Validators.required),
    amount: new FormControl(0, [Validators.required]),
    currency: new FormControl("", [Validators.required]),
    closeDate: new FormControl(""),
  });
  constructor(
    private dealSrv: DealsService,
    private generalSrv: GeneralService,
    private quotationSrv: QuotationService,
    private currencySrv: CurrencyService,
    private invoiceSrv: InvoiceService,
    private salesorderSrv: SalesOrderService,
    public sanitizer: DomSanitizer,
    private documentSrv: DocumentService,
    private clientSrv: ClientService
  ) {}
  ngOnInit() {
    this.getData();
  }
  toggleClass(className: string, dropdownClass?) {
    dropDownToggle(className, dropdownClass);
  }
  parsedate(date) {
    return new Date(date);
  }
  get getFormInvalid() {
    const {amount, clientName, closeDate } = this.updateDealForm.value;
    return !((amount!==null&&amount!==''&&amount>=0)&& clientName && closeDate);
  }
  getData() {
    this.quotationList$ = this.quotationSrv.getQuotationByFilter(
      "dealId=" + this.deal.code
    );
    this.fillDeal();
    this.getStages();
    this.getAllInvoice();
    this.getAllSalesOrder();
    this.getOrgCurrency();
  }
  getCunSymbol(symbol) {
    return getCurrencySymbol(symbol);
  }
  getOrgCurrency() {
    this.currencySrv.org_currencies.subscribe(org_currencies => {      
      this.currencyList = this.generalSrv.convertObjectToArray(org_currencies.currencies);
    })
  }
  getStages() {
    this.dealSrv
      .fetchStages(this.deal.salesProcessID)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.stageList = data;
        this.getDocument();
      });
  }
  getAllInvoice() {
    this.invoiceSrv
      .getInvoiceByFilter(`dealId=${this.deal.code}`)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        if (data) {
          this.invoiceList = data.payload;
        }
      });
  }
  getAllSalesOrder() {
    this.salesorderSrv
      .fetchDealSalesOrder(this.deal.code)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => (this.salesorderList = data));
  }

  getRequiredDoc() {
    const extractedDocs = [];
    const stageWithDoc = this.stageList.filter(
      (item) => item.documents && item.documents.length
    );
    stageWithDoc.forEach((stage) => {
      stage.documents.forEach((doc) => {
        extractedDocs.push({
          stageName: stage.name,
          id: `${stage.id}+${doc}`,
          document: doc,
        });
      });
    });
    console.log("stage list", this.stageList);
    console.log("doc list", this.documentList);

    const arr1 = this.documentList.map((item) => ({
      id: item.stageID,
      document: item.name,
    }));
    this.requiredDocument = extractedDocs.filter(comparer(arr1));

    console.log("req", this.requiredDocument);
  }

  edit() {
    this.editMode = true;
    console.log(this.updateDealForm.invalid);
    
  }
  cancel() {
    this.editMode = false;
  }
  // fill the input value with the data from the deal
  fillDeal() {
    if (this.deal) {
      const {
        clientName,
        clientID,
        amount,
        closeDate,
        currency
      } = this.deal;
      const client = { id: clientID, name: clientName };
      const data = {
        clientName,
        amount,
        closeDate: this.parsedate(closeDate),
        currency
      };
      this.updateDealForm.patchValue(data);
      this.updateDealForm.controls.clientName.setValue(client);
    }    
  }
  dealUpdateoading = false;
  updateDeal() {
    const { id, name } = this.updateDealForm.value.clientName;
    const contactCompanyData = { clientID: id, clientName: name };
    if (this.updateDealForm.valid) {
      const body = {
        ...this.deal,
        ...this.updateDealForm.value,
        ...contactCompanyData,
      };
      this.generalSrv.sweetAlertFileUpdates("deal").then((result) => {
        if (result.value) {
          this.dealUpdateoading = true;
          this.dealSrv
            .updateDeal(body)
            .subscribe(
              (res: any) => {
                this.generalSrv.sweetAlertSucess(res.message);
                this.getDeal.emit();
              },
              (err) => {
                this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err));
              }
            )
            .add(() => {
              this.cancel();
              this.dealUpdateoading = false;
            });
        } else {
          this.cancel();
        }
      });
    }
  }

  uploadFile(e, i, doc) {
    console.log(doc);
    const { files } = e.target;
    if (files[0]) {
      this.requiredDocument[i].size = filesize(files[0].size)
      $(`#libUploadBtn-${i}`).addClass("d-none");
      $(`.uploadBtn-${i}`).addClass("d-inline");
    } else {
      this.requiredDocument[i].size = null
      $(`.uploadBtn-${i}`).removeClass("d-inline");
      $(`#libUploadBtn-${i}`).removeClass("d-none");
    }
    this.storeFiles[i] = { file: files[0], stageID: `${doc.id}` };
  }

  cancelUpload(i) {
    this.requiredDocument[i].size = null
    $(`.uploadBtn-${i}`).removeClass("d-inline");
    $(`#libUploadBtn-${i}`).removeClass("d-none");
    $(`#dFile${i}`).val("");
  }
  // Change Document
  selectedChangeDoc;
  disableChangeDocBtn;
  seletedChangeFile: File;
  handleChangeDoc(doc) {
    this.selectedChangeDoc=doc;
    $('#ChangeDocBtn').click();
  }
  browseChangeDoc(event) {
    this.seletedChangeFile = event.target.files[0];
  }
  changeDoc() {
    if(this.seletedChangeFile) {
      this.disableChangeDocBtn = true;
      const payload = {...this.selectedChangeDoc,code: this.selectedChangeDoc.keyID, file: this.seletedChangeFile};
      console.log(payload);
      this.documentSrv.upload(payload, 'deals', null, 'changeFile').subscribe((res: any) => {
        this.getDocument();
        this.seletedChangeFile = null;
        this.selectedChangeDoc = null
        this.generalSrv.sweetAlertSucess(res.message)
      }, err => {
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err))
      }).add(() => {
        this.disableChangeDocBtn = false;
        $('#closeChangeDocModal').click();
      })
    }
  }
  deleteDoc({ id, name }) {
    this.generalSrv.sweetAlertFileDeletions(name).then((res) => {
      if (res.value) {
        this.documentSrv.deleteFile(id).subscribe(
          (res: any) => {
            this.getDocument();
            this.generalSrv.sweetAlertSucess(res.message);
          },
          (err) =>
            this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err))
        );
      }
    });
    console.log(document);
  }
  docUploadSucess() {
    $("#closelibUpload").click();
    this.loading = null;
    this.generalSrv.sweetAlertSucess("Your document has been uploaded");
    // this.callDealStage.emit();
    this.getDocument();
  }
  upload(key) {
    const { file, stageID } = this.storeFiles[key];
    const body = {
      file,
      stageID,
      code: this.deal.code,
      teamId: this.deal.teamID,
    };
    $(`.uploadBtn-${key}`).removeClass("d-inline");
    this.loading = key;
    this.documentSrv.upload(body, "deals").subscribe(
      () => {
        this.docUploadSucess();
      },
      (err) => {
        this.loading = null;
        $(`.uploadBtn-${key}`).addClass("d-inline");
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err));
        console.log(err);
      }
    );
  }
  libDocData: LibaryModel = {
    category: "deals",
    keyID: "",
    stageID: "",
  };
  docName = "";
  openLibUpload(stage) {
    console.log(stage);

    this.libDocData.stageID = stage.id;
    this.libDocData.keyID = this.deal.code;
    this.docName = stage.document;
  }
  getDocument() {
    console.log("get document");
    this.documentSrv
      .fetchAll(this.deal.code)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any[]) => {
        this.documentList = data;
        this.getRequiredDoc();
      });
  }
  closeViewDoc() {
    this.fileDetail = false;
    console.log("close");
  }
  viewFile(file) {
    this.viewDoc.openDoc(file);
    // this.fileDetail = file;
  }
  downloadFile(file) {
    this.documentSrv
      .download(file.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => {
        const b: Blob = new Blob([data], { type: file.type });
        const url = window.URL.createObjectURL(b);
        window.open(url, "_blank");
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", file.name);
        link.click();
      });
  }

  openContent(content) {
    document.getElementById(`${content}-tab`).click();
    $("html, body").animate(
      { scrollTop: $(`#${content}-tab`).offset().top },
      "slow"
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
