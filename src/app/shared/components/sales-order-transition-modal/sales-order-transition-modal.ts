import { DocumentService } from "../../../services/document.service";
import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
} from "@angular/core";
import { takeUntil, concatMap, mergeMap } from "rxjs/operators";
import { Subject, Observable, forkJoin, combineLatest, from } from "rxjs";
import { comparer } from "src/app/utils/utils";
import $ from "jquery";
import { GeneralService } from "src/app/services/general.service";
import * as fileSize from "filesize";
import { SalesOrderModel } from "src/app/models/sales-order.model";

@Component({
  selector: "app-sales-order-transition-modal",
  templateUrl: "./sales-order-transition-modal.html",
  styleUrls: ["./sales-order-transition-modal.css"],
})
export class SalesOrderTransitionModalComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<any>();
  @Output() submitData = new EventEmitter();
  @Input() modalId = "exampleModalCenter";
  @Input() closeModalId = null;
  @Input() salesOrder: SalesOrderModel;
  transitionDetails;
  needsDocument = [];
  fileErrMsg = false;
  selectedFile: File;
  activeStage;
  documentList = [];
  docsTobeUploaded = [];

  loading = false;
  supenseLoading = false;
  nextStage;

  constructor(
    private documentSrv: DocumentService,
    private gs: GeneralService
  ) {}

  ngOnInit() {}

  uploadFile(event, index, doc) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.needsDocument[index].size = fileSize(this.selectedFile.size);
      this.docsTobeUploaded[index] = { file: this.selectedFile, id: doc.id };
    } else {
      this.needsDocument[index].size = null;
      this.docsTobeUploaded[index] = null;
    }
    console.log("upload");
  }

  getRequiredDoc(
    nextStage,
    transitionDetails,
    activeStage,
    moveSalesOrderForward = true
  ) {
    // console.log(transitionDetails, nextStage, activeStage, "olau");
    this.supenseLoading = false;
    this.closeModalAndReset();
    this.nextStage = nextStage;
    const activeSplit = activeStage.split("-");
    this.activeStage = {
      id: activeSplit[0],
      name: activeSplit[1],
    };
    this.transitionDetails = transitionDetails;
    if (this.salesOrder.code && activeStage) {
      if (moveSalesOrderForward) {
        this.getDocument();
      } else {
        this.supenseLoading = true;
      }
    }
  }

  getDocument() {
    this.documentSrv
      .fetchAll(this.salesOrder.code)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any[]) => {
        this.documentList = data;
        this.checkIfDocIsRequired();
      });
  }

  checkIfDocIsRequired() {
    const extractedDocs = [];
    if (
      this.activeStage &&
      this.transitionDetails.documents &&
      this.transitionDetails.documents.length
    ) {
      this.transitionDetails.documents.forEach((doc) => {
        extractedDocs.push({
          id: `${this.activeStage.id}+${doc}`,
          document: doc,
        });
      });
      const arr1 = this.documentList.map((item) => ({
        id: item.stageID,
        document: item.name,
      }));
      this.needsDocument = extractedDocs.filter(comparer(arr1));
      this.supenseLoading = true;
    } else {
      this.needsDocument = [];
      this.supenseLoading = true;
    }
    return this.needsDocument;
  }

  saveChanges() {
    this.loading = true;
    if (this.needsDocument.length) {
      this.docsTobeUploaded = this.docsTobeUploaded.filter(
        (doc) => doc != null
      );
      if (this.needsDocument.length === this.docsTobeUploaded.length) {
        this.fileErrMsg = false;

        const data = {
          stageID: this.activeStage.id,
          code: this.salesOrder.code,
          teamId: this.salesOrder.teamID,
        };
        // upload documents
        from(this.docsTobeUploaded)
          .pipe(
            concatMap((doc) =>
              this.documentSrv.upload(
                { file: doc.file, ...data, stageID: doc.id },
                "salesorder"
              )
            )
          )
          .subscribe(
            () => {
              this.getDocument();
              this.submitData.emit("UploadCompleted");
            },
            (err) => {
              this.gs.sweetAlertError(this.gs.getErrMsg(err));
            }
          )
          .add(() => {
            const closeId = this.closeModalId || "closeDModal";
            this.loading = false;
            $(`#${closeId}`).click();
            this.closeModalAndReset();
          });
      } else {
        this.loading = false;
        this.fileErrMsg = true;
      }
    } else {
      this.submitData.emit("NoUploads");
    }
  }

  closeModalAndReset() {
    this.fileErrMsg = false;
    this.selectedFile = null;
    this.loading = false;
    this.needsDocument = [];
    this.docsTobeUploaded = [];
    if (document.getElementById("doc-file")) {
      (document.getElementById("doc-file") as HTMLInputElement).value = null;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
