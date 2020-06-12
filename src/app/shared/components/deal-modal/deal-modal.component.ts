import { DealModel } from "src/app/models/deal.model";
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

@Component({
  selector: "app-deal-modal",
  templateUrl: "./deal-modal.component.html",
  styleUrls: ["./deal-modal.component.css"],
})
export class DealModalComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<any>();
  @Output() submitData = new EventEmitter();
  @Input() dealCode;
  @Input() modalId = "exampleModalCenter";
  @Input() closeModalId = null;
  deal: DealModel;
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
  showCondition(data): boolean {
    if (data === "" || data === null || data === '""') {
      return false;
    } else {
      return true;
    }
  }
  getRequiredDoc(
    activeStage,
    deal: DealModel,
    nextStage,
    moveDealForward = true
  ) {
    console.log("yoka");
    this.supenseLoading = false;
    this.closeModalAndReset();
    this.activeStage = activeStage;
    this.nextStage = nextStage;
    this.deal = deal;
    if (this.deal.code && activeStage) {
      if (moveDealForward) {
        this.getDocument();
      } else {
        this.supenseLoading = true;
      }
    }
  }
  getDocument() {
    this.documentSrv
      .fetchAll(this.deal.code)
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
      this.activeStage.documents &&
      this.activeStage.documents.length
    ) {
      this.activeStage.documents.forEach((doc) => {
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
  }
  saveChanges() {
    const body: any = {
      code: this.deal.code,
      stageID: this.nextStage.id,
      stageName: this.nextStage.name,
    };
    this.loading = true;
    if (this.needsDocument.length) {
      this.docsTobeUploaded = this.docsTobeUploaded.filter(
        (doc) => doc != null
      );
      if (this.needsDocument.length === this.docsTobeUploaded.length) {
        this.fileErrMsg = false;
        /*  
        const obsInstances$: Observable<any>[] = [];
        this.docsTobeUploaded.forEach(doc => {
          obsInstances$.push(this.documentSrv.upload({file: doc.file,...data, stageID: doc.id}, 'deals'))
        })
        combineLatest(...obsInstances$).pipe(takeUntil(this.unsubscribe))
        */
        const data = {
          stageID: this.activeStage.id,
          code: this.deal.code,
          teamId: this.deal.teamID,
        };
        // upload documents
        let count = 0;
        from(this.docsTobeUploaded)
          .pipe(
            concatMap((doc) =>
              { 
                count+=1;
                return this.documentSrv.upload({ file: doc.file, ...data, stageID: doc.id },"deals")
              }
            )
          )
          .subscribe(
            () => {
              if(count === this.docsTobeUploaded.length) {
                this.getDocument();
                this.submitData.emit(body);
              }
              console.log('count =>', count);
              
         
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
      this.submitData.emit(body);
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
