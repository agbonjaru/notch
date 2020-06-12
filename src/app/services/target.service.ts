import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Endpoints } from "../shared/config/endpoints";
import { Observable, of } from "rxjs";
import { Router } from '@angular/router';
import { SalesPersonService } from './crew-services/sales-person.service';
import { TeamsService } from './crew-services/teams.service';

@Injectable({
  providedIn: "root"
})
export class TargetService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private endpoints: Endpoints,
    private teamsService: TeamsService,
    private salesPersonService: SalesPersonService
  ) { 
    this.getSalesPersons();
  }

  // Handle Errors
  private handleError = (error: any): Observable<any> => {
    let message = '';
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    console.log(error, " Targets Error");
    console.log(message, " Targets Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get addPeriodUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.addPeriod;
  }
  private get getPeriodsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getPeriods;
  }
  private get updatePeriodUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.updatePeriod;
  }
  private get deletePeriodUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.deletePeriod;
  }
  private get getSubPeriodsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getSubPeriods;
  }
  private get addTargetUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.addTarget;
  }
  private get getTargetsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getTargets;
  }
  private get updateTargetUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.updateTarget;
  }
  private get deleteTargetUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.deleteTarget;
  }
  private get getTargetListsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getTargetLists;
  }
  private get getTargetLimitUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getTargetLimit;
  }
  private get getTargetPeriodsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getTargetPeriods;
  }
  private get getAssignedPeriodsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getAssignedPeriods;
  }
  private get addAssignedTargetUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.addAssignedTarget;
  }
  private get getAssignedTargetsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getAssignedTargets;
  }
  private get getAssignedTargetsV2Url() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getAssignedTargetsV2;
  }
  private get deleteAssignedTargetUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.deleteAssignedTarget;
  }
  private get addAssignedTeamTargetUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.addAssignedTeamTarget;
  }
  private get getAssignedTeamTargetsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getAssignedTeamTargets;
  }
  private get deleteAssignedTeamTargetUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.deleteAssignedTeamTarget;
  }
  private get getCommissionsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getCommissions;
  }
  private get addAssignedCommissionUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.addAssignedCommission;
  }
  private get getAssignedCommissionsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getAssignedCommissions;
  }
  private get deleteAssignedCommissionUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.deleteAssignedCommission;
  }
  private get addCommissionProfileUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.addCommissionProfile;
  }
  private get getCommissionProfilesUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getCommissionProfiles;
  }
  private get updateCommissionProfileUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.updateCommissionProfile;
  }
  private get deleteCommissionProfileUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.deleteCommissionProfile;
  }
  private get getCommittalsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getCommittals;
  }
  private get addCommissionPaymentUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.addCommissionPayment;
  }
  private get getCommissionPaymentsUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getCommissionPayments;
  }
  private get reverseCommissionPaymentUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.reverseCommissionPayment;
  }
  private get addCommissionProcessUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.addCommissionProcess;
  }
  private get getCommissionProcessesUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getCommissionProcesses;
  }
  private get reverseCommissionProcessUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.reverseCommissionProcess;
  }
  private get addTargetFilterUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.addTargetFilter;
  }
  private get getTargetFiltersUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.getTargetFilters;
  }
  private get updateTargetFilterUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.updateTargetFilter;
  }
  private get deleteTargetFilterUrl() {
    return this.endpoints.targetServiceUrl + this.endpoints.target.deleteTargetFilter;
  }

  addPeriod(payload) {
    try {
      return this.http
        .post(this.addPeriodUrl, payload)
    } catch (error) {
      alert(error);
    }
  }

  getPeriods(queryString?) {
    try {
      return this.http
        .get(`${this.getPeriodsUrl}?${queryString || ''}`)
    } catch (error) {
      alert(error);
    }
  }

  updatePeriod(id, payload) {
    try {
      return this.http
        .put(`${this.updatePeriodUrl}${id}`, payload)
    } catch (error) {
      alert(error);
    }
  }

  deletePeriod(id) {
    try {
      return this.http
        .delete(`${this.deletePeriodUrl}${id}`)
    } catch (error) {
      alert(error);
    }
  }

  getSubPeriods(id) {
    try {
      return this.http
        .get(`${this.getSubPeriodsUrl}${id}`)
    } catch (error) {
      alert(error);
    }
  }

  addTarget(payload) {
    try {
      return this.http
        .post(this.addTargetUrl, payload)
    } catch (error) {
      alert(error);
    }
  }

  getTargets(queryString?) {
    try {
      return this.http
        .get(`${this.getTargetsUrl}?${queryString || ''}`)
    } catch (error) {
      alert(error);
    }
  }

  updateTarget(id, payload) {
    try {
      return this.http
        .put(`${this.updateTargetUrl}${id}`, payload)
    } catch (error) {
      alert(error);
    }
  }

  deleteTarget(id) {
    try {
      return this.http
        .delete(`${this.deleteTargetUrl}${id}`)
    } catch (error) {
      alert(error);
    }
  }

  getTargetLists(userId?, queryString?) {
    try {
      return this.http
        .get(`${this.getTargetListsUrl}${userId || ''}?${queryString || ''}`)
    } catch (error) {
      alert(error);
    }
  }

  getTargetLimit(targetId) {
    try {
      return this.http
        .get(`${this.getTargetLimitUrl}${targetId}`)
    } catch (error) {
      alert(error);
    }
  }

  getTargetPeriods(targetId) {
    try {
      return this.http
        .get(`${this.getTargetPeriodsUrl}${targetId}`)
    } catch (error) {
      alert(error);
    }
  }

  getAssignedPeriods(userId, targetId) {
    try {
      return this.http
        .get(`${this.getAssignedPeriodsUrl}${userId}/${targetId}`)
    } catch (error) {
      alert(error);
    }
  }

  addAssignedTarget(payload) {
    try {
      return this.http
        .post(this.addAssignedTargetUrl, payload)
    } catch (error) {
      alert(error);
    }
  }

  getAssignedTargets(targetId) {
    try {
      return this.http
        .get(`${this.getAssignedTargetsUrl}${targetId}`)
    } catch (error) {
      alert(error);
    }
  }

  getAssignedTargetsV2(targetId) {
    try {
      return this.http
        .get(`${this.getAssignedTargetsV2Url}${targetId}`)
    } catch (error) {
      alert(error);
    }
  }

  deleteAssignedTarget(id, userId) {
    try {
      return this.http
        .delete(`${this.deleteAssignedTargetUrl}${id}/${userId}`)
    } catch (error) {
      alert(error);
    }
  }

  addAssignedTeamTarget(payload) {
    try {
      return this.http
        .post(this.addAssignedTeamTargetUrl, payload)
    } catch (error) {
      alert(error);
    }
  }

  getAssignedTeamTargets(targetId) {
    try {
      return this.http
        .get(`${this.getAssignedTeamTargetsUrl}${targetId}`)
    } catch (error) {
      alert(error);
    }
  }

  deleteAssignedTeamTarget(id, teamId) {
    try {
      return this.http
        .delete(`${this.deleteAssignedTeamTargetUrl}${id}/${teamId}`)
    } catch (error) {
      alert(error);
    }
  }

  getCommissions(userId?, queryString?) {
    try {
      return this.http
        .get(`${this.getCommissionsUrl}${userId || ''}?${queryString || ''}`)
    } catch (error) {
      alert(error);
    }
  }

  addAssignedCommission(payload) {
    try {
      return this.http
        .post(this.addAssignedCommissionUrl, payload)
    } catch (error) {
      alert(error);
    }
  }

  getAssignedCommissions(targetId) {
    try {
      return this.http
        .get(`${this.getAssignedCommissionsUrl}${targetId}`)
    } catch (error) {
      alert(error);
    }
  }

  deleteAssignedCommission(id, userId) {
    try {
      return this.http
        .delete(`${this.deleteAssignedCommissionUrl}${id}/${userId}`)
    } catch (error) {
      alert(error);
    }
  }

  addCommissionProfile(payload) {
    try {
      return this.http
        .post(this.addCommissionProfileUrl, payload)
    } catch (error) {
      alert(error);
    }
  }

  getCommissionProfiles(queryString?) {
    try {
      return this.http
        .get(`${this.getCommissionProfilesUrl}?${queryString || ''}`)
    } catch (error) {
      alert(error);
    }
  }

  updateCommissionProfile(id, payload) {
    try {
      return this.http
        .put(`${this.updateCommissionProfileUrl}${id}`, payload)
    } catch (error) {
      alert(error);
    }
  }

  deleteCommissionProfile(id) {
    try {
      return this.http
        .delete(`${this.deleteCommissionProfileUrl}${id}`)
    } catch (error) {
      alert(error);
    }
  }

  getTargetCommittals(user, type, userId, targetId, start, end, stage?) {
    try {
      return this.http
        .get(
          `${this.getCommittalsUrl}${user}/${type}/${userId}/${targetId}?start=${start}&end=${end}&stage=${stage ||''}`
        )
    } catch (error) {
      alert(error);
    }
  }

  getCommittals(user, type, userId, start, end, stage?) {
    try {
      return this.http
        .get(
          `${this.getCommittalsUrl}${user}/${type}/${userId}?start=${start}&end=${end}&stage=${stage || ''}`
        )
    } catch (error) {
      alert(error);
    }
  }

  getCompanyCommittals(type, targetId, start, end, stage?) {
    try {
      return this.http
        .get(
          `${this.getCommittalsUrl}${type}/${targetId}?start=${start}&end=${end}&stage=${stage || ''}`
        )
    } catch (error) {
      alert(error);
    }
  }

  addCommissionPayment(payload) {
    try {
      return this.http
        .post(this.addCommissionPaymentUrl, payload)
    } catch (error) {
      alert(error);
    }
  }

  getCommissionPayments(commissionId) {
    try {
      return this.http
        .get(`${this.getCommissionPaymentsUrl}${commissionId}`)
    } catch (error) {
      alert(error);
    }
  }

  reverseCommissionPayment(commissionId) {
    try {
      return this.http
        .get(`${this.reverseCommissionPaymentUrl}${commissionId}`)
    } catch (error) {
      alert(error);
    }
  }

  addCommissionProcess(payload) {
    try {
      return this.http
        .post(this.addCommissionProcessUrl, payload)
    } catch (error) {
      alert(error);
    }
  }

  getCommissionProcesses(commissionId) {
    try {
      return this.http
        .get(`${this.getCommissionProcessesUrl}${commissionId}`)
    } catch (error) {
      alert(error);
    }
  }

  reverseCommissionProcess(commissionId) {
    try {
      return this.http
        .get(`${this.reverseCommissionProcessUrl}${commissionId}`)
    } catch (error) {
      alert(error);
    }
  }

  addTargetFilter(payload) {
    try {
      return this.http
        .post(this.addTargetFilterUrl, payload)
    } catch (error) {
      alert(error);
    }
  }

  getTargetFilters(teamId, module) {
    try {
      return this.http
        .get(`${this.getTargetFiltersUrl}?teamId=${teamId}&module=${module}`)
    } catch (error) {
      alert(error);
    }
  }

  updateTargetFilter(id, payload) {
    try {
      return this.http
        .put(`${this.updateTargetFilterUrl}${id}`, payload)
    } catch (error) {
      alert(error);
    }
  }

  deleteTargetFilter(id) {
    try {
      return this.http
        .delete(`${this.deleteTargetFilterUrl}${id}`)
    } catch (error) {
      alert(error);
    }
  }

  convertObjectToQueryString(obj) {
    if (
        !obj 
        || Object.keys(obj).length === 0 
        || obj.constructor !== Object
    ) 
      return false;

    const queryString  = Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
    return queryString;
  }

  getActiveTargetModule() {
    return (this.router.url.split('/'))[2];
  }

  getTargetTypes() {
    return [
      {
        name: 'Revenue',
        value: 'revenue',
        counts: ['deal', 'payment'],
        commissionEnabled: true
      },
      {
        name: 'Markup',
        value: 'markup',
        counts: ['sales_order'],
        commissionEnabled: true
      },
      {
        name: 'Product/Service Revenue',
        value: 'product_revenue',
        counts: ['invoice', 'sales_order'],
        commissionEnabled: true
      },
      {
        name: 'Product/Service Quantity',
        value: 'product_quantity',
        counts: ['invoice', 'sales_order'],
        commissionEnabled: false
      },
      {
        name: 'Contact',
        value: 'contact',
        commissionEnabled: false
      },
      {
        name: 'Company',
        value: 'company',
        commissionEnabled: false
      },
      {
        name: 'Lead',
        value: 'lead',
        commissionEnabled: false
      }
    ];
  }

  getTargetType(type) {
    let result = {
      name: null,
      value: null,
    };
    if (type) {
      const type_array = this.getTargetTypes().filter(
        type_obj => { return type_obj.value === type }
      );
      result = type_array[0] || result;
    }
    return result;
  }


  getTargetTypesDropdown() {
    const target_types = this.getTargetTypes();
    return new Observable(observer => {
      observer.next(
        target_types.map(e => {
          return { id: e.value, description: e.name };
        })
      );
    });
  }

  getTargetStages() {
    return [
      {
        name: 'on deal won',
        value: 'deal'
      },
      {
        name: 'on invoice approval',
        value: 'invoice'
      },
      {
        name: 'on payment collection',
        value: 'payment'
      },
      {
        name: 'on sales order approval',
        value: 'sales_order'
      }
    ];
  }

  getTargetStage(stage) {
    let result = {
      name: null,
      value: null,
    };
    if (stage) {
      const stage_array = this.getTargetStages().filter(
        stage_obj => { return stage_obj.value === stage }
      );
      result = stage_array[0] || result;
    } else {
      result.name = 'none';
      result.value = 'none';
    }
    return result;
  }

  getTargetStagesDropdown(targetType?) {
    let target_stages = this.getTargetStages();
    if (targetType) {
      const [target_type] = this.getTargetTypes().filter(type => { return type.value === targetType });
      target_stages = (target_type.counts || []).map(type => {
        const [target_count] = this.getTargetStages().filter(stage => { return stage.value === type })
        return target_count;
      });
    }
    return new Observable(observer => {
      observer.next(
        target_stages.map(e => {
          return { id: e.value, description: e.name };
        })
      );
    });
  }

  getSalesPersons() {
    return new Promise((resolve, reject) => {
      this.salesPersonService.fetchAllSalePersons()
        .subscribe(response => {
          resolve(response);
      },
      error => {
        reject(error);
        console.log(error.message);
      });
    });
  }

  getTeams() {
    return new Promise((resolve, reject) => {
      this.teamsService.fetchAllTeams()
        .subscribe(response => {
          resolve(response);
      },
      error => {
        reject(error);
        console.log(error.message);
      });
    });
  }

  async updateArrayWithSalesPersonObj(key, array) {
    const salespersons: any = await this.getSalesPersons();
    return new Promise((resolve, reject) => {
      resolve(
        array.map(obj => {
          const salesperson = (salespersons.filter(e => {
            return e.id === Number(obj[key]);
          }))[0];
          obj.creator = salesperson || {name:'--'};
          obj.creator_name = obj.creator.name;
          return obj;
        })
      );
    });
  }

  async updateArrayWithTeamObj(key, array) {
    const teams: any = await this.getTeams();
    return new Promise((resolve, reject) => {
      resolve(
        array.map(obj => {
          const team = (teams.filter(e => {
            return e.teamID === Number(obj[key]);
          }))[0];
          obj.team = team || {teamName:'--'};
          obj.team_name = obj.team.teamName;
          return obj;
        })
      );
    });
  }
}
