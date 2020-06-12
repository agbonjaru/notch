import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Endpoints } from "src/app/shared/config/endpoints";
import { GeneralService } from "../general.service";

@Injectable({
  providedIn: "root",
})
export class BulkMessagesService {
  orgId: number;
  userId: number;
  private server_uri = this.endpoints.communicationsEndpoint;
  private settings_server = this.endpoints.settingsUrl;

  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private generalService: GeneralService
  ) {
    this.orgId = this.generalService.orgID;
    this.userId = this.generalService.user.id;
  }

  public sendMessage(data: any) {
    const { orgId, userId } = this;
    return this.http.post(`${this.server_uri}/bulk-sms/message`, {
      ...data,
      orgId,
      userId,
    });
  }
  public getSMSUnit() {
    const { orgId } = this;
    return this.http.get(
      `${this.settings_server}/settingsservice/${orgId}/getTwoFactorSMSByCompany`
    );
  }

  public getCompanyIntegrations() {
    const { orgId } = this;
    return this.http.get(`${this.settings_server}/settingsservice/${orgId}/getIntegrationsByCompany`);
  }

  public updateSMSUnits(payload) {
    return this.http.post(
      `${this.settings_server}/settingsservice/saveTwoFactorSMS`,
      payload
    );
  }
}
