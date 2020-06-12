import { Store } from '@ngrx/store';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { DealFilterModel, DealModel } from "../models/deal.model";
import { Endpoints } from "../shared/config/endpoints";
import DateUtils from "../utils/date";
import { GeneralService } from "./general.service";
import { AppState } from '../store/app.state';

export interface DealFilterFormatModel {
  dateFilter?: any;
  creatorId?: any;
  client?: any;
  closeDate?: any;
  value?: any;
  winPro?: any;
  profileScore?: any;
  status?: any
}
@Injectable({
  providedIn: "root",
})
export class DealsService {
  orgId = 0;
  teamId = "0";
  userId;
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private gs: GeneralService,
    store: Store<AppState>
  ) {
    store.select('userInfo').subscribe(info => {
      this.orgId = info.organization.id;
      this.userId = info.user.id;
      this.teamId = info.user.teamID;
    })
  }
  dateUtil = new DateUtils();
  settingApi = this.endpoints.settingsUrl + "/settingsservice";
  localApi = "http://10.10.100.79:8080/salesservice";
  salesUrl = this.endpoints.salesUrl;
  winningProb = (Math.random() * 50).toFixed(2);
  profileScore = (Math.random() * 50).toFixed();

  createDeal(form: DealModel) {
    const body = {
      ...form,
      closeDate: (this.dateUtil.getTimeStp(form.closeDate) + ''),
      clientID: form.client.id,
      clientName: form.client.name,
      clientEmail: form.client.email,
      creatorID: (form.creatorID as any).id,
      source: (form.creatorID as any).name,
      hasQuote: false,
      orgID: this.orgId,
      profileScore: this.profileScore,
      salesCompetitors: form.salesCompetitors.map(sales => ({ name: sales.fullname, id: sales.id })),
      salesProcessID: form.salesProcessName.split("+")[0],
      salesProcessName: form.salesProcessName.split("+")[1],
      stageID: form.currStage.split("+")[0],
      currStage: form.currStage.split("+")[1],
      winningProb: this.winningProb,
    };
    return this.http.post(this.salesUrl + "/newDeal", body);
  }

  fetchDeals(teamId?, filter?: DealFilterFormatModel) {
    const { getTimeStp } = this.dateUtil;
    let endpoint = "/getTeamDeals";
    const dateFilter = filter && filter.dateFilter ? filter.dateFilter : null;
    let body = {
      ...this.dateUtil.getDateFilter(dateFilter),
      contactType: "",
      filter: "",
      dealValueFrom: "",
      dealValueTo: "",
      orgID: this.orgId,
      salesProcessID: "",
      teamID: teamId ? teamId : this.teamId,
      from: "",
      to: "",
    };
    if (filter) {
      const {
        closeDate,
        client,
        creatorId,
        value,
        profileScore,
        winPro,
        status
      } = filter;
      if (creatorId) {
        body = { ...body, filter: creatorId.owner };
        endpoint = "/getCreatorDeals";
      }
      if (status) {
        endpoint = '/getDealsByStatus';
        body = { ...body, filter: status };
      }
      if (client) {
        body = { ...body, filter: client.client.id, contactType: client.type };
        endpoint = "/getContactDeals";
      }
      if (closeDate) {
        const dateFit = { ...this.dateUtil.getDateFilter(closeDate) };
        body = { ...body, ...dateFit };
        endpoint = "/getCloseDateTeamDeals";
      }
      if (value) {
        body = { ...body, dealValueFrom: value.from, dealValueTo: value.to };
        endpoint = "/getAmountDeals";
      }
      if (winPro) {
        body = { ...body, from: winPro.from, to: winPro.to };
        endpoint = "/getWinningProbDeals";
      }
      if (profileScore) {
        body = { ...body, from: profileScore.from, to: profileScore.to };
        endpoint = "/getProfileScoreDeals";
      }
    }
    return this.http.post(this.salesUrl + endpoint, body);
  }

  getSalesPersonsDeals(id) {
    return this.http.get(this.salesUrl + `/${this.orgId}/${id}/getAllCreatorDeals`);
  }

  updateDeal(body) {
    return this.http.post(this.salesUrl + "/editDeal", body);
  }

  fetchDeal(id) {
    return this.http.get(this.salesUrl + `/${id}` + "/getDeal");
  }

  fetchSaleCompetitor() {
    return this.http.get(
      this.settingApi + `/${this.orgId}/getSalesCompetitorByCompany`
    );
  }

  fetchAllProducts() {
    return this.http.get(
      this.settingApi + `/${this.orgId}/getProductsByCompany`
    );
  }

  fetchSalesProcess() {
    return this.http.get(
      this.settingApi + `/${this.orgId}/getDealsPipelineWorkflows`
    );
  }
  fetchOrgPiplelineWorkflow() {
    return this.http.get(`${this.settingApi}/${this.orgId}/getOrgDealsPipelineWorkflows`)
  }

  fetchStages(processId) {
    return this.http.get(
      this.settingApi + `/${processId}/getDealsPipelineStages`
    );
  }

  changeStage(form) {
    let body = { ...form, status: 0 };
    if (form.stageName === "Won") {
      body = { ...form, status: 2 };
    }
    if (form.stageName === "Lost") {
      body = { ...form, status: 1 };
    }

    return this.http.post(this.salesUrl + "/changeStage", body);
  }

  fetchPipelineDeals(processId, teamId?, filter?) {
    const { getCurrentTs, getTimeStp, getPrvMntTs } = this.dateUtil;
    const dateFilter = filter && filter.dateFilter ? filter.dateFilter : null;
    const endDate = dateFilter
      ? getTimeStp(dateFilter.endDate)
      : getCurrentTs();
    const startDate = dateFilter
      ? getTimeStp(dateFilter.startDate)
      : getPrvMntTs();
    let endpoint = "/getPipelineDeals";
    let body = {
      endDate,
      filter: "",
      orgID: this.orgId,
      salesProcessID: processId,
      startDate,
      teamID: teamId ? teamId : this.teamId,
      creatorID: "",
    };
    if (filter) {
      if (filter.salesperson) {
        endpoint = "/getCreatorPipelineDeals";
        body = { ...body, creatorID: filter.salesperson };
      }
    }
    return this.http.post(this.salesUrl + endpoint, body);
  }

  createFilter(body, teamId) {
    const newBody = {
      ...body,
    };
    const data = {
      clientID: newBody.client && newBody.client.id ? newBody.client.id : 0,
      clientName: newBody.client && newBody.client.name ? newBody.client.name : '',
      clientType: newBody.client && newBody.client.name ? 'CLIENT' : '',
      dealOwnerID: newBody.dealOwner && newBody.dealOwner.id ? newBody.dealOwner.id : 0,
      dealOwnerName: newBody.dealOwner && newBody.dealOwner.name ? newBody.dealOwner.name : '',
      dealValueFrom: newBody.dealValueFrom || 0,
      dealValueTo: newBody.dealValueTo || 0,
      dealStatus: newBody.dealStatus ? newBody.dealStatus : '',
      name: newBody.filterName,
      orgID: this.orgId,
      teamID: teamId || this.teamId,
    };
    console.log(data);

    return this.http.post(this.salesUrl + "/newDealsCustomFilter", data);
  }

  deleteFilter(filter) {
    return this.http.delete(
      this.salesUrl + `/${filter.id}/deleteDealsCustomFilter`
    );
  }

  fetchFilters(teamId) {
    return this.http.get(
      this.salesUrl + `/${this.orgId}/${teamId || this.teamId}/getDealsCustomFilters`
    );
  }

  editFilter(filter: any) {
    const body = {
      ...filter,
      name: filter.name,
      dealValueFrom: filter.dealValueFrom ? filter.dealValueFrom : 0,
      dealValueTo: filter.dealValueTo ? filter.dealValueTo : 0,
      dealOwnerID: filter.dealOwnerName.id ? filter.dealOwnerName.id : 0,
      dealOwnerName: filter.dealOwnerName.name ? filter.dealOwnerName.name : '',
      clientType: filter.clientName ? 'Client' : '',
      clientID: filter.clientName.id ? filter.clientName.id : 0,
      clientName: filter.clientName.name ? filter.clientName.name : '',
    };
    console.log(body);

    return this.http.post(this.salesUrl + "/editDealsCustomFilter", body);
  }

  fetchFilteredDeals(filterId) {
    return this.http.get(this.salesUrl + `/${filterId}/getFilteredDeals`);
  }
  fetchMultiDeals(ids:any[]) {
    return this.http.get(this.salesUrl+`/${ids.toString()||0}/getMultiDeals`);
  }

  /**
   * Get Multiple Deals for teams and Salesperson
   * @param id (SalespersonId , TeamsId)
   * @param type (1 = salesperson, 2 = teams)
   */
  getMultipleDeals(id, type) {
    return this.http.get(this.salesUrl + `/${id}/${type}/${this.orgId}/getMultipleDeals`);
  }
  
}
