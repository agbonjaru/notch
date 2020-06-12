import { FormGroup, FormControl } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { map, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import $ from 'jquery';
import FileExt from 'src/app/utils/file-ext';
import { DocumentModel, ViewDocComponent } from 'src/app/shared/components/view-doc/view-doc.component';
import { DocumentService } from 'src/app/services/document.service';
import * as filesize from 'filesize';
declare var gapi: any;
declare var google: any;
var pickerApiLoaded = false;
var token = '';
var oauthToken;
var  scope = 'https://www.googleapis.com/auth/drive.file';
var appId = "11175888903";
var developerKey = 'AIzaSyCZ4NtkLFwPRHi235GnuKksrIPpWDEnPtE';
var clientId = "11175888903-cuubjqua6bkv700vc37in7var1aqg0fr.apps.googleusercontent.com";
   
@Component({
  selector: 'app-doc-library',
  templateUrl: './doc-library.component.html',
  styleUrls: ['./doc-library.component.css']
})
export class DocLibraryComponent implements OnInit, OnDestroy {
  @ViewChild(ViewDocComponent) viewDoc: ViewDocComponent
  private unsubscribe = new Subject();
  shareForm = new FormGroup({
    shareTo: new FormControl('general')
  })
  fileExt = new FileExt;
  generalDocList: DocumentModel[]; filteredgeneralDocList: DocumentModel[]
  teamDocList: DocumentModel[]; filteredteamDocList: DocumentModel[]
  personalDocList: DocumentModel[]; filteredpersonalDocList: DocumentModel[]
  selectedFile: File;
  disableBtn = false;
  viewFile;
  totalStorage;
  totalStorageUsage;
  storagePercent = '0' 

  
  file = '';
  pickerApiLoaded = false;
  
  values$ = combineLatest(
    this.docSrv.getDocumentByOrd(),
    this.docSrv.getDocumentByTeam(),
    this.docSrv.getDocumentByOwner()
  ).pipe(map(([org , team, personal]) => {
      return { org, team, personal}
    }))
  constructor(
    private docSrv: DocumentService,
    private generalSrv: GeneralService) {
      // $.getScript('https://apis.google.com/js/api.js');
     }

  ngOnInit() {
    this.getData()
  } 
  getFilesize(size) {
    return filesize(size);
  }
  getData() {
    this.getStorage()
    this.values$.pipe(takeUntil(this.unsubscribe))
    .subscribe(({org, team, personal} :any) => {
      this.filteredgeneralDocList = this.generalDocList = org;
      this.filteredteamDocList = this.teamDocList = team;
      this.filteredpersonalDocList = this.personalDocList = personal;
    });
  }
  getStorage() {
    this.docSrv.fetchDocStorageStatus().subscribe((res: any) => {
     this.totalStorage = res.total;
     this.totalStorageUsage = res.used;
     this.CalculateSize();

    })
  }
  changeShareTo(shareTo: string) {
    this.shareForm.setValue({shareTo});
  }
  onBrowseFile() {
    $('#fileUpload').click();
  }
  browseFile(event) {
    this.selectedFile = event.target.files[0];
  }
  upload() {
    if(this.selectedFile) {
      this.disableBtn = true;
      const { shareTo } = this.shareForm.value;
      this.docSrv.uploadToLibrary(this.selectedFile, shareTo).pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.getData();
        this.generalSrv.sweetAlertSucess('File Uploaded')
      }, (err) => {
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err));
      }).add(() => {
        this.disableBtn = false;
        $('#uploadedFile').val('');
        this.selectedFile = ('' as any);
        $('.close').click();
      })
    }
  } 
  openDoc(file) {
    this.viewDoc.openDoc(file); 
    // this.viewFile = file;    
    // console.log(this.viewFile);
  }
  searchFile(event) {
    const { value } = (event.target);
    this.generalDocList =  this.filteredgeneralDocList.filter(this.fiterVal(value))
    this.teamDocList = this.filteredteamDocList.filter(this.fiterVal(value))
    this.personalDocList = this.filteredpersonalDocList.filter(this.fiterVal(value))
    if(value) {
    }
  }
  private fiterVal(value) {
  return doc => doc.name.toLowerCase().includes(value.toLowerCase())
   
  }
  private CalculateSize() {
    this.storagePercent = ((this.totalStorageUsage / this.totalStorage) * 100).toFixed(4);  
    console.log(this.storagePercent);
    
  }

  //Google Drive


   
   // Use the API Loader script to load google.picker and gapi.auth.
    onApiLoad() {
    gapi.load('auth2', onAuthApiLoad);
    gapi.load('picker', onPickerApiLoad);
   } 
   
 
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}

function  createPicker() {
if (pickerApiLoaded && oauthToken) {
  var picker = new google.picker.PickerBuilder().
      addView(google.picker.ViewId.DOCS).
      setOAuthToken(oauthToken).
      setDeveloperKey(developerKey).
      setCallback(pickerCallback).
      build();
  picker.setVisible(true);
}
}
function onAuthApiLoad() {
  var authBtn = document.getElementById('auth');
  authBtn.addEventListener('click', function() {
    gapi.auth2.init({ client_id: clientId }).then(function(googleAuth) {
      googleAuth.signIn({ scope: scope }).then(function(result) {
        handleAuthResult(result.getAuthResponse());
      })
    })
  });
 }
 
 function onPickerApiLoad() {
  pickerApiLoaded = true;
  createPicker();
 }
 
 function handleAuthResult(authResult) {
  token = authResult.access_token;
  if (authResult && !authResult.error) {
   oauthToken = authResult.access_token;
    createPicker();
  }
 }
 

 
 // A simple callback implementation.
 function pickerCallback(data) {
   console.log(data);
   
  var url = 'nothing';
  if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    var doc = data[google.picker.Response.DOCUMENTS][0];
    url = doc[google.picker.Document.URL];
  }
  console.log(url);
  // var message = 'You picked: ' + url;
  // document.getElementById('result').innerHTML = message;
 }