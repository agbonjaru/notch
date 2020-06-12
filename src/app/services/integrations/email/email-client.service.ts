import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GeneralService } from "../../general.service";

@Injectable({
  providedIn: 'root'
})
export class EmailClientService {
  owner: number;
  orgId: number;

  private host =  this.endpoints.fourFourSixEndpoint;

  constructor(
    private endpoints: Endpoints,
    private http: HttpClient,
    private generalService: GeneralService,
  ) { 
    this.owner = this.generalService.orgID;
    this.orgId = this.generalService.user.id;
  }

  fetchClientsByWildcard(wildcard : string, baseRoute: string) {
    return this.http.get(`${this.host}/${baseRoute}/wildcard/${wildcard}`);
  }

}
