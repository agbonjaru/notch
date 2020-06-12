import { UserModel, OrgModel } from '../../store/storeModels/user.model';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from '../../shared/config/endpoints';
import { Injectable } from '@angular/core';
import { GeneralService } from '../general.service';
import { GeneralTaskModel } from '../../models/task.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class GeneralTaskService {

  private taskapi = this.endpoint.analyticsUrl;
  private signupapi = this.endpoint.signupUrl;
  private dealsapi = this.endpoint.salesServiceUrl;
  private clientapi = this.endpoint.fourFourSixEndpoint;
  private whatsAppApi = this.endpoint.whatsAppUrl;
  private user: UserModel

  constructor(
    private endpoint: Endpoints,
    private http: HttpClient,
    private gs: GeneralService
  ) {
    this.user = this.gs.user
  }

  /**
   * Error Handler
   */
  private handleError = (error: any): Observable<any> => {
    let message = "";
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    return of(null);
  };

  //New Flow
  getAllTasks() {
    try {
      return this.http.get(`${this.taskapi}/getTasks/${this.user.id}/${this.gs.orgID}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    };
  }

  /**
  * Get Multiple TASK for CreatedBy and AssignedBy
  * @param type (1 = CreatedBy, 2 = AssignedTo)
  */
  getTaskForMe(type) {
    try {
      return this.http.get(`${this.taskapi}/getTasksForMe/${this.user.id}/${this.gs.orgID}/${type}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    };
  }

  /**
  * Add Task
  * @param form 
  */
  createTask(form: GeneralTaskModel) {
    let tmpDate = form.remindDate.toLocaleDateString().split('/');
    let remindDate2 = `${tmpDate[1]}-0${tmpDate[0]}-${tmpDate[2]}`;
    let remindTime = form.remindTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const body = {
      assignedUserID: form.assignedUserID,
      category: 'general',
      channel: 'notch',
      creatorUserID: this.user.id,
      description: form.taskDescription,
      dueDate: `${remindDate2}`,
      dueTime: `${remindTime}`,
      orgID: this.gs.orgID,
      taskName: form.taskName
    };
    return this.http.post(`${this.taskapi}/task`, body);
  }

  /**
    * Get Task By ID
    * @param id 
    */
  getTaskByID(id) {
    return this.http.get(`${this.taskapi}/task/${id}`);
  }

  /**
   * Edit Task
   * @param form 
   */
  editGeneralTaskByID(form: GeneralTaskModel) {
    let remindDate2 = form.remindDate;
    let remindTime = form.remindTime
    const body = {
      taskName: form.taskName,
      dueDate: `${remindDate2}`,
      dueTime: `${remindTime}`,
      description: form.taskDescription,
      assignedUserID: form.assignedUserID
    };
    return this.http.put(`${this.taskapi}/taskUpdated/${form.taskID}`, body);
  }

  /**
   * Mark Task As Complete with task id
   * @param id 
   */
  markTaskAsCompleted(id) {
    const body = {
      status: 'completed'
    }
    return this.http.put(`${this.taskapi}/statusUpdate/${id}`, body);
  }

  /**
  * Mark Task As Complete with task id
  * @param id 
  */
  markTaskAsVoid(id) {
    const body = {
      status: 'voided'
    }
    return this.http.put(`${this.taskapi}/updateStatusAsVoided/${id}`, body);
  }

  /**
   * Get client Filter By USERID AND CLIENTID
   * @param userID 
   * @param clientID 
   */
  getFilteredClient(userID, clientID) {
    try {
      return this.http.get(`${this.taskapi}/getTasks/client/${userID}/${this.gs.orgID}/${clientID}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    };
  }

  /**
  * Get client Filter By USERID AND CLIENTID
  * @param userID 
  * @param status (Pending, completed, overdue, voided)
  */
  getFilteredByStatus(status) {
    try {
      return this.http.get(`${this.taskapi}/filterTaskByStatusType/${this.user.id}/${this.gs.orgID}/${status}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    };
  }

  /**
   * Get client Filter By USERID AND CLIENTID
   * @param userID 
   * @param clientID 
   */
  getFilteredDeal(userID, dealCode) {
    try {
      return this.http.get(`${this.taskapi}/getTasks/deals/${userID}/${this.gs.orgID}/${dealCode}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    };
  }

  /**
   * Get Deal Suggestions by form input
   * @param form 
   */
  getDealSuggestions(form) {
    return this.http.get(`${this.dealsapi}/${form.inputText}/${this.gs.orgID}/getDealSuggestions`);
  }

  /**
   * Get User Filtered Task
   * @param creatorUserID 
   * @param assignedUserID 
   */
  getUserFilteredTask(creatorUserID, assignedUserID) {
    try {
      return this.http.get(`${this.taskapi}/filterTasks/${creatorUserID}/${assignedUserID}/${this.gs.orgID}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    };
  }

  //New Flow ends here

  //arrange date and time in api expected format
  getGeneralPendingTasks() {
    return this.http.get(`${this.taskapi}/task/status/${this.user.id}/${this.gs.orgID}/pending/general`);
  }

  getGeneralCompletedTasks() {
    return this.http.get(`${this.taskapi}/task/status/${this.user.id}/${this.gs.orgID}/completed/general`);
  }

  getAllGeneralTasks() {
    return this.http.get(`${this.taskapi}/tasks/${this.user.id}/${this.gs.orgID}/general`);
  }

  getFilteredUserTasks(userID, taskStatus) {
    return this.http.get(`${this.taskapi}/task/status/${userID}/${this.gs.orgID}/${taskStatus}/general`);
  }

  getAllOrganisationUsers() {
    return this.http.get(`${this.signupapi}/getUsersInOrganization/${this.gs.orgID}`);
  }

  /**
   * Whatsapp Number
   * @param form
   */
  integrateWhatsapp(form) {
    const body = {
      whatsappNumber: form.whatsappNumber,
    }
    console.log(body, " body1");    
    return this.http.put(`${this.signupapi}/editUserWhatsappNumber/${this.user.id}`, body);
  }
  
  /**
   * WhatsApp Bot Integration
   * @param form 
   */
  integrateWhatsappBot(form) {
    const body = {
      userPhone: form.whatsappNumber,
    }
    console.log(body, " body");    
    return this.http.post(`${this.whatsAppApi}/taskbot/enable/`, body);
  }

  getUsersBySupervisor() {
    return this.http.get(`${this.signupapi}/getAllSupervisorUsers/${this.gs.orgID}/${this.user.email}`);
  }

  getClientByOrgID() {
    return this.http.get(`${this.clientapi}/clients`);
  }

}
