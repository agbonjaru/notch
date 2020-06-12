import { GeneralService } from 'src/app/services/general.service';
import { DocumentService } from './../../../services/document.service';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { selectConfig } from 'src/app/utils/utils';
export interface LibaryModel{
  category: string;
  keyID: string;
  stageID: string;
}
@Component({
  selector: 'app-library-upload',
  templateUrl: './library-upload.component.html',
  styleUrls: ['./library-upload.component.css']
})

export class LibraryUploadComponent implements OnInit, OnDestroy {
  @Input() data: LibaryModel;
  @Output() onSuccess = new EventEmitter();
  private unsubscribe = new Subject();
  docConfig = {...selectConfig}
  generalDocList$ = this.documentSrv.getDocumentByOrd();
  teamDocList$ = this.documentSrv.getDocumentByTeam();
  personalDocList$ = this.documentSrv.getDocumentByOwner();
  generalFile = null;
  teamFile;
  personalFile;
  selectedDoc;
  disableBtn = false;
  constructor(
    private documentSrv: DocumentService,
    private gs: GeneralService) { }

  ngOnInit() {
  }
  initFiles() {
    this.generalFile = [];
    this.teamFile = [];
    this.personalFile = [];
  }
  uploadFromDoc(type) {
    let file = type === 'general' ? this.generalFile : type === 'team' ? this.teamFile : this.personalFile;
    if(this.data) {
      const { category, keyID, stageID} = this.data
      const body = {id: file.id, category, keyID, stageID};
      this.disableBtn = true;
      this.documentSrv.updateFile(body).pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.disableBtn = false;
        this.initFiles();
        this.onSuccess.emit()
      }, (err) => {
        this.disableBtn = false;
        this.gs.sweetAlertError(this.gs.getErrMsg(err))
      })
    }
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


}
