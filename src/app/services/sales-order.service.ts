import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { SalesOrderModel } from "../models/sales-order.model";
import { Endpoints } from "../shared/config/endpoints";
import { UserModel } from "../store/storeModels/user.model";
import DateUtils from "../utils/date";
import { environment } from "./../../environments/environment.prod";
import { GeneralService } from "./general.service";

@Injectable({
  providedIn: "root",
})
export class SalesOrderService {
  private localApi = `${environment.localUrl}8080/salesservice`;
  private date = new DateUtils();
  private salesUrl = this.endPoints.salesUrl;
  private settingUrl = this.endPoints.settingsUrl + "/settingsservice";
  orgID;
  teamID;
  user: UserModel;
  private invoiceSource = new BehaviorSubject("");
  currentInvoice = this.invoiceSource.asObservable();

  constructor(
    private http: HttpClient,
    private endPoints: Endpoints,
    private gs: GeneralService
  ) {
    this.user = this.gs.user;
    this.orgID = this.gs.org.id;
    this.teamID = this.gs.user.teamID;
  }

  createSalesOrder(form: SalesOrderModel, type) {
    const endpoint = type === "create" ? "/newSalesOrder" : "/editSalesOrder";
    const body = {
      ...form,
      clientID: (form.clientName as any).id,
      clientName: (form.clientName as any).name,
      workflowID: (form.workflowName as any).id,
      workflowName: (form.workflowName as any).name,
      creatorID: (form.source as any).id,
      source: (form.source as any).name,
      stageID: form.stageName.split("+")[0],
      stageName: form.stageName.split("+")[1],
      transitionID: form.transitionName.split("+")[0],
      transitionName: form.transitionName.split("+")[1],
      orgID: this.orgID,
    };
    return this.http.post(this.salesUrl + endpoint, body);
  }

  fetchAllSalesOrder(teamId?, filter?) {
    let endpoint = "getTeamSalesOrders";
    let body = {
      ...this.date.getDateFilter(filter),
      orgID: this.orgID,
      teamID: teamId ? teamId : this.teamID,
      ...filter,
    };
    if (filter) {
      endpoint = filter.creatorID
        ? "getSalesOrderByCreator"
        : filter.fromValue && filter.toValue
        ? "getSalesOrderByValue"
        : filter.value && filter.type
        ? "getClientSalesOrders"
        : filter.status
        ? "getSalesOrderByStatus"
        : endpoint;
    }
    return this.http.post(this.salesUrl + `/${endpoint}`, body);
  }

  fetchSalesOrder(code) {
    return this.http.get(this.salesUrl + `/${code}/getSalesOrder`);
  }

  fetchClientSalesOrder(clientId) {
    const date = new Date();
    const endDate = date.getTime();
    const startDate = date.setMonth(date.getMonth() - 1).valueOf();
    const body = {
      endDate,
      orgID: this.orgID,
      startDate,
      value: clientId,
      type: 1,
    };
    return this.http.post(this.salesUrl + "/getClientSalesOrders", body);
  }

  fetchAllWorkFlows() {
    return this.http.get(this.settingUrl + `/${this.orgID}/getWorkflows`);
  }

  fetchAllTransitions(id) {
    return this.http.get(
      this.settingUrl + `/${this.orgID}/${id}/getTransitions`
    );
  }

  fetchAllTransitionStages(data: {
    salesOrderID: string;
    startStageID: string;
  }) {
    return this.http.get(
      this.settingUrl +
        `/${data.salesOrderID}/${data.startStageID}/getCurrTransitionStages`
    );
  }

  chanageStatus(body: { type: string; code: string }) {
    let status = 1;
    const { type, code } = body;
    status = type === "Approve" ? 2 : 1;
    return this.http.get(
      this.salesUrl + `/${code}/${status}/approveOrDeclineSalesOrder`
    );
  }

  addComment(form) {
    const body = {
      ...form,
      writer: this.user.firstName + " " + this.user.lastName,
    };
    return this.http.post(this.salesUrl + "/newSalesOrderComment", body);
  }

  fetchComment(id) {
    return this.http.get(this.salesUrl + `/${id}/getSalesOrderComments`);
  }

  fetchDealSalesOrder(dealCode) {
    return this.http.get(this.salesUrl + `/${dealCode}/getDealSalesOrders`);
  }

  fetchSalesOrderGraph(year, team) {
    return this.http.get(
      this.salesUrl +
        `/${year}/${this.orgID}/${team || this.teamID}/getSalesOrderGraphStats`
    );
  }

  convertToInvoce(invoice) {
    this.invoiceSource.next(invoice);
  }

  createFilter(payload) {
    const body = {
      ...payload,
      orgID: this.orgID.toString(),
      creatorID: payload.creator.id || 0,
      creatorName: payload.creator.name || "",
      id: 0,
      clientID: payload.client.id || 0,
      clientName: payload.client.name || "",
      teamID: this.teamID,
    };
    delete body.client;
    delete body.creator;
    console.log(body, "hole");
    return this.http.post(this.salesUrl + "/newSalesOrderCustomFilter", body);
  }

  fetchFilter() {
    return this.http.get(
      this.salesUrl + `/${this.orgID}/${this.teamID}/getSalesOrderCustomFilters`
    );
  }

  fetchFilteredSalesOrders(id) {
    return this.http.get(this.salesUrl + `/${id}/getFilteredSalesOrders`);
  }

  editFilter(payload) {
    const body = {
      ...payload,
      orgID: this.orgID,
      creatorID: payload.creator.id,
      creatorName: payload.creator.name,
      clientID: payload.client.clientID,
      clientName: payload.client.clientName,
      teamID: this.teamID,
    };
    return this.http.post(this.salesUrl + "/editSalesOrderCustomFilter", body);
  }

  deleteFilter(id) {
    return this.http.delete(
      this.salesUrl + `/${id}/deleteSalesOrderCustomFilter`
    );
  }

  /**
   * Get Multiple SalesOrder for teams and Salesperson
   * @param id(SalespersonId, TeamsId)
   * @param type (1 = salesperson, 2 = teams)
   */
  getMultipleSalesOrders(id, type) {
    return this.http.get(
      this.salesUrl + `/${id}/${type}/${this.orgID}/getMultipleSalesOrders`
    );
  }
}
