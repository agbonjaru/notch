import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import FileExt from "src/app/utils/file-ext";
import { DocumentService } from "src/app/services/document.service";
import { GeneralService } from "src/app/services/general.service";
import $ from "jquery";

export interface DocumentModel {
  category: string;
  displayURI: string;
  downloadURI: string;
  id: number;
  keyID: string;
  name: string;
  orgID: string;
  ownerID: string;
  size: number;
  stageID: string;
  teamID: string;
  type: string;
}

@Component({
  selector: "app-view-doc",
  templateUrl: "./view-doc.component.html",
  styleUrls: ["./view-doc.component.css"],
})
export class ViewDocComponent implements OnInit {
  fileExt = new FileExt();
  onlineViewer = "https://view.officeapps.live.com/op/embed.aspx?src=";
  @Input() document: DocumentModel;
  @Input() currentStage;
  @Output() updateFiles = new EventEmitter();
  docForDelete: DocumentModel;  
  downloadLoading = false;
  constructor(
    public sanitizer: DomSanitizer,
    private documentSrv: DocumentService,
    private gs: GeneralService
  ) {
    console.log("view doc");
  }

  ngOnInit() {}
  closeViewDoc() {
    this.document = null;
  }

  openDoc(doc) {
    this.document = doc;
    setTimeout(() => {
      $("#viewDocBtn").click();
    }, 100);
  }
  downloadFile() {
    if (this.document) {
      const file = this.document;
      this.downloadLoading = true;
      this.documentSrv
        .download(file.id)
        .subscribe(
          (data) => {
            const b: Blob = new Blob([data], { type: file.type });
            const url = window.URL.createObjectURL(b);
            window.open(url, "_blank");
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", file.name);
            link.click();
          },
          (err) => {
            this.gs.sweetAlertError(this.gs.getErrMsg(err));
          }
        )
        .add(() => {
          this.downloadLoading = false;
        });
    }
  }

  deleteFile() {
    this.docForDelete = this.document;
    $(".close").click();
    const msg = "Sorry! You Cannot Delete This File As It Is Already In Use";
    let stageId = Number(this.docForDelete.stageID.split("+")[0]);
    if (this.docForDelete.keyID) {
      if(this.docForDelete.category==='deals') {
        this.gs.sweetAlertFieldValidatio(msg);
      } else {
        if (stageId === this.currentStage.startStageID) {
          this.handleFilteDeletion()
        } else {
          this.gs.sweetAlertFieldValidatio(msg);
        }
      }
    } else {
      this.handleFilteDeletion()
    }
  }

  handleFilteDeletion() {
    this.gs.sweetAlertFileDeletions(this.docForDelete.name).then((res) => {
      if (res.value) {
        this.documentSrv.deleteFile(this.docForDelete.id).subscribe(
          (res: any) => {
            this.gs.sweetAlertSucess(res.message);
            this.updateFiles.emit("");
          },
          (err) => {
            this.gs.sweetAlertError(this.gs.getErrMsg(err));
          }
        );
      }
    });
  }
}
