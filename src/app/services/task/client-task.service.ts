import { UserModel, OrgModel } from '../../store/storeModels/user.model';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from '../../shared/config/endpoints';
import { Injectable } from '@angular/core';
import { GeneralService } from '../general.service';
import { ClientTaskModel } from '../../models/task.model';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientTaskService {
  private taskapi = this.endpoint.analyticsUrl;
  private clientapi = this.endpoint.fourFourSixEndpoint;
  private user: UserModel

  // task_context specifying the part of the page where task feeds are needed
  public task_context = new BehaviorSubject<any>({});

  constructor(
    private endpoint: Endpoints,
    private http: HttpClient,
    private gs: GeneralService,
    private route: ActivatedRoute
  ) {
    this.user = this.gs.user
  }

  getTaskByID(id) {
    return this.http.get(`${this.taskapi}/task/${id}`);
  }

  /**
   * Get task by deal , lead, contact, company , salesperson
   * @param id (Deals,, lead, Contacts, Company, Salesperson)
   * @param type (1=Deals, 2= lead, 2=Contacts, 2=Company, 3=Salesperson)
   */
  getBasicClientTask(id, type) {
    return this.http.get(`${this.taskapi}/filterTaskByType/${id}/${this.gs.orgID}/${type}`);
  }

  /**
 * Filter pending task by deal , leads, contact, company , salesperson
 * @param id (Deals,, lead, Contacts, Company, Salesperson)
 * @param type (1=Deals, 2= lead, 2=Contacts, 2=Company, 3=Salesperson)
 */
  getBasicClientPendingTask(id, type) {
    const status = "pending"
    return this.http.get(`${this.taskapi}/filterTaskByStatusPending/${id}/${this.gs.orgID}/${type}/${status}`);
  }

  /**
* Filter completed task by deal , leads, contact, company , salesperson
* @param id (Deals,, lead, Contacts, Company, Salesperson)
* @param type (1=Deals, 2= lead, 2=Contacts, 2=Company, 3=Salesperson)
*/
  getBasicClientCompletedTask(id, type,) {
    const status = "completed"
    return this.http.get(`${this.taskapi}/filterTaskByStatusCompleted/${id}/${this.gs.orgID}/${type}/${status}`);
  }

  /**
* Filter overdue task by deal , leads, contact, company , salesperson
* @param id (Deals,, lead, Contacts, Company, Salesperson)
* @param type (1=Deals, 2= lead, 2=Contacts, 2=Company, 3=Salesperson)
*/
  getBasicClientOverdueTask(id, type) {
    const status = "overdue"
    return this.http.get(`${this.taskapi}/filterTaskByStatusOverdue/${id}/${this.gs.orgID}/${type}/${status}`);
  }

  /**
* Filter voided task by deal , leads, contact, company , salesperson
* @param id (Deals, lead, Contacts, Company, Salesperson)
* @param type (1=Deals, 2= lead, 2=Contacts, 2=Company, 3=Salesperson)
*/
  getBasicClientVoidedTask(id, type) {
    const status = "voided"
    return this.http.get(`${this.taskapi}/filterTaskByStatusVoided/${id}/${this.gs.orgID}/${type}/${status}`);
  }

  getAllClientTasks() {
    return this.http.get(`${this.taskapi}/tasks/${this.user.id}/${this.gs.orgID}/client`);
  }

  getClientPendingTasks() {
    return this.http.get(`${this.taskapi}/tasks/status/${this.user.id}/${this.gs.orgID}/pending/client`);
  }

  getClientCompletedTasks() {
    return this.http.get(`${this.taskapi}/tasks/status/${this.user.id}/${this.gs.orgID}/completed/client`);
  }

  //api to be created
  getFilteredClientTasks(clientID, taskStatus) {
    return this.http.get(`${this.taskapi}/getTasks/client/${this.user.id}/${this.gs.orgID}/${clientID}`);
  }

  markTaskAsCompleted(id) {
    const body = {
      status: 'completed'
    }
    return this.http.put(`${this.taskapi}/statusUpdate/${id}`, body);
  }

  /**
   * Update Task with  Assigned Deal nad Client
   * @param form 
   */
  pushTaskToClientCategory(form: ClientTaskModel) {
    const clientID = form.associatedClientID.split(" ")[0];
    const clientName = form.associatedClientID.split(" ")[1] + " " + form.associatedClientID.split(" ")[2] + " " + form.associatedClientID.split(" ")[3];
    const body = {
      ...form,
      associatedClientID: `${clientID}`,
      category: 'client',
      clientName: `${clientName}`,
      dealName: form.taskDealName,
      id: form.id,
      taskDeal: form.taskDeal
    };
    return this.http.put(`${this.taskapi}/updateTask`, body);
  }

  getClientByOrgID() {
    return this.http.get(`${this.clientapi}/clients`);
  }

}
