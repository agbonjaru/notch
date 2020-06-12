import { GeneralService } from "src/app/services/general.service";
import { Endpoints } from "./../shared/config/endpoints";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  salesUrl = this.endpoints.salesUrl;
  orgId;
  teamId;
  userId;
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private generalSrv: GeneralService
  ) {
    this.orgId = this.generalSrv.org.id;
    this.teamId = this.generalSrv.user.teamID;
    this.userId = this.generalSrv.user.id;
  }

  upload(form, category, viewLevel = 2, actionType ='uploadFile') {
    const { file, stageID, code, teamId , id} = form;
    const newTeamId = teamId || this.teamId;
    let path = `/${stageID}/${code}/${category}/${this.userId}/${this.orgId}/${newTeamId}/${viewLevel? viewLevel: 2}`;
    path = actionType==='changeFile'?`${path}/${id}`: path;
    const fd = new FormData();
    fd.append("file", file, file.name);
    this.generalSrv.httpStatus.next("imageHeaders");
    return this.http.post(this.salesUrl + `${path}/${actionType}`, fd);
  }
  fetchAll(code) {
    return this.http.get(this.salesUrl + `/${code}/getDocuments`);
  }
  download(id) {
    return this.http.get(this.salesUrl + `/${id}/downloadFile`, {
      responseType: "blob",
    });
  }
  updateFile(body) {
    return this.http.post(this.salesUrl + `/updateFile`, body);
  }
  getDocumentByOrd() {
    return this.http.get(this.salesUrl + `/${this.orgId}/getDocumentsByOrgID`);
  }
  getDocumentByTeam() {
    return this.http.get(
      this.salesUrl + `/${this.teamId}/getDocumentsByTeamID`
    );
  }
  getDocumentByOwner() {
    return this.http.get(
      this.salesUrl + `/${this.userId}/getDocumentsByOwnerID`
    );
  }
  uploadToLibrary(file: File, shareTo: string) {
    let viewLevel = 1;
    const shareType = { general: null, team: null, personal: null };
    const fd = new FormData();
    fd.append("file", file, file.name);
    // if(shareTo === 'general') {
    //   shareType.general = this.orgId
    //   viewLevel = 3
    // } else if(shareTo === 'team') {
    //   shareType.team = this.teamId;
    //   viewLevel = 2
    // } else {
    //   shareType.personal = this.userId;
    //   viewLevel = 1
    // }
    viewLevel = shareTo === "general" ? 3 : shareTo === "team" ? 2 : viewLevel;
    const { general, team, personal } = shareType;
    const path = `${this.userId}/${this.orgId}/${this.teamId}`;
    return this.http.post(
      this.salesUrl + `/${path}/${viewLevel}/uploadToLibrary`,
      fd
    );
  }
  fetchDocStorageStatus() {
    return this.http.get(this.salesUrl + `/${this.orgId}/getStorageStatus`);
  }
  deleteFile(id) {
    return this.http.delete(this.salesUrl + `/${id}/deleteFile`);
  }
}
