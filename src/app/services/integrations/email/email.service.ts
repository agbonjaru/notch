import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Endpoints } from "src/app/shared/config/endpoints";
import { GeneralService } from "../../general.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class EmailService {
  orgId;
  userId;

  private server_uri = `${this.endpoints.communicationsEndpoint}`;
  private deals_uri = this.endpoints.salesUrl;
  private imap_server_uri = `${this.server_uri}/mails/imap/setting`;

  /** BEHAVIOURALSUBJECT */
  public selectedEmail = new BehaviorSubject<any>({});
  public email_is_modal = new BehaviorSubject<any>(false);
  public user_data = new BehaviorSubject<any>({});
  public sales_item = new BehaviorSubject<any>({});

  // email_context specifying the part of the page where email feeds are needed
  public email_context = new BehaviorSubject<any>({});
  public new_email = new BehaviorSubject<any>({});
  public context_primary_email_address = new BehaviorSubject("");

  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private generalService: GeneralService
  ) {
    //
    this.orgId = this.generalService.org ? this.generalService.org.id : '';
    this.userId = this.generalService.user ? this.generalService.user.id : '';
  }

  getUserData() {
    this.user_data.value;
  }

  setSelectedEmail(email) {
    this.selectedEmail.next(email);
  }

  /** HTTP */
  fetchAccessTokenDataFromServer() {
    const query_string = `userId=${this.userId}&orgId=${this.orgId}&service=gmail,office,imap`;
    return this.http.get(`${this.server_uri}/users/user?${query_string}`);
  }

  saveAccessTokenOnServer(data: any) {
    const { orgId, userId } = this;
    return this.http.post(`${this.server_uri}/users/user`, {
      ...data,
      orgId,
      userId,
    });
  }

  revokeUserAccess(recordId) {
    return this.http.delete(
      `${this.server_uri}/users/user/${this.orgId}/${recordId}`
    );
  }

  saveImapUser(data: any) {
    const { orgId, userId } = this;
    return this.http.post(`${this.server_uri}/mails/imap/setting/user`, {
      ...data,
      orgId,
      userId,
    });
  }

  /** */
  uploadAttachment(data) {
    return this.http.post(`${this.server_uri}/attachments/new`, data);
  }

  sendMail(data: any, service: string) {
    return this.http.post(`${this.server_uri}/mails/${service}/message`, {
      ...data,
    });
  }

  sendSalesItemMail(data, type: string) {
    return this.http.post(
      `${this.server_uri}/mails/sales/${type.toLowerCase()}`,
      { ...data }
    );
  }

  /** */
  filterThreads(query: string) {
    return this.http.get(`${this.server_uri}/threads/filter?${query}`);
  }

  filterMessages(query: string) {
    return this.http.get(`${this.server_uri}/messages/filter?${query}`);
  }

  filterAttachments(query: string) {
    return this.http.get(`${this.server_uri}/attachments/filter?${query}`);
  }

  /** */
  updateMessage(payload: any) {
    return this.http.put(`${this.server_uri}/messages/message`, { ...payload });
  }

  /** IMAP CONFIGURATION */
  createImapSetting(data) {
    return this.http.post(`${this.imap_server_uri}`, { ...data });
  }

  deactivateImapSettings() {
    return this.http.delete(this.imap_server_uri);
  }

  fetchImapSettings() {
    return this.http.get(`${this.imap_server_uri}`);
  }

  updateImapSetting(data) {
    return this.http.put(`${this.imap_server_uri}`, { ...data });
  }

  /** DEALS */
  fetchDeals(name: string) {
    return this.http.get(
      `${this.deals_uri}/${name}/${this.orgId}/getDealSuggestions`
    );
  }
}
