import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Endpoints } from '../../shared/config/endpoints';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {

  private statusMsg = new BehaviorSubject<string>('');
  currentMessage = this.statusMsg.asObservable();

  private permissionStatus = new BehaviorSubject<string>('');
  currentStatus = this.permissionStatus.asObservable();


  constructor(private http: HttpClient,
              private config: Endpoints,
              private gs: GeneralService) { }



  // Permission API Config
  private get permissionAPI() {
    const url = this.config.settingsUrl + this.config.permissions.baseurl;
    return url;
  }

  changeMessage(message: string) {
    this.statusMsg.next(message);
  }

  changePermissionStatus(PermissionStatus: string) {
    this.permissionStatus.next(PermissionStatus);
  }

  // PULL =>  GET: get  all permission from server
  getAllPermissions(): Observable<any[]> {
    return this.http
      .get<any[]>(this.permissionAPI + this.config.permissions.get)
      .pipe(catchError(this.gs.handleError));
  }

  // CREATE =>  GET: add a new permission to the server
  getPermissionByStatus(PermissionStatus: any) {
    return this.http
      .get<any[]>(this.permissionAPI + `/${PermissionStatus}` + this.config.permissions.ByStatus)
      .pipe(catchError(this.gs.handleError));
  }

  // PULL =>  GET: get permission by module from the server
  getPermissionByModule(PermissionModule: any) {
    return this.http.get<any[]>(this.permissionAPI + `/${PermissionModule}` + this.config.permissions.ByStatus)
  }
  getAllModule() {
    return this.http.get(this.config.signUpEndpoint + '/getAllModules');
  }
  fetchAllPriveledges() {
    return this.http.get(this.config.signUpEndpoint + '/getAllPriviledges');
  }
  fetchSectionModules(type) {
    return this.http.get(this.config.signUpEndpoint + `/${type}/getSectionModules`)
  }
  fetchPrivByModule({modul, type}) {
    return this.http.get(this.config.signUpEndpoint + `/${modul}/${type}/getAllPriviledgesByModuleAndStatus`)
  }
}
