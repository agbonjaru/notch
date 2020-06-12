import { Injectable } from "@angular/core";
import { UserModel, OrgModel } from "src/app/store/storeModels/user.model";
import { Endpoints } from "src/app/shared/config/endpoints";
import { HttpClient } from "@angular/common/http";
import { GeneralService } from "../general.service";

@Injectable({
  providedIn: "root",
})
export class GroupService {
  private signupApi = this.endpoint.signUpEndpoint;
  private user: UserModel;
  private org: OrgModel;
  private groupID = "25";
  constructor(
    private endpoint: Endpoints,
    private http: HttpClient,
    private gs: GeneralService
  ) {
    this.user = this.gs.user;
    this.org = this.gs.org;
  }

  createGroup(payload: { name: string; members: any[] }) {
    const body = {
      ...payload,
      orgID: this.org.id,
      members: payload.members.map((mem) => ({ id: mem.id })),
      groupLead: 0,
    };
    return this.http.post(this.signupApi + "/newGroup", body);
  }

  fetchGroup() {
    return this.http.get(this.signupApi + `/${this.org.id}/getGroups`);
  }

  fetchOneGroup(id) {
    return this.http.get(this.signupApi + `/${id}/getGroupDetails`);
  }

  editGroup(payload) {
    return this.http.post(this.signupApi + "/editGroup", payload);
  }

  editGroupName(payload, groupID) {
    const url = `${this.signupApi}/editGroupName/${groupID}/`;
    return this.http.put(url, payload);
  }

  addGroupMember(payload) {
    const body = {
      groupID: payload.groupID,
      orgID: this.org.id,
      agents: payload.agents,
    };
    return this.http.post(this.signupApi + "/GroupMembers/add", body);
  }

  removeGroupMember(groupID: number, agentID: number) {
    console.log(groupID + " " + agentID, "knjxbcksvnknkcnku");
    const url = `${this.signupApi}/${this.gs.orgID}/${groupID}/${agentID}/removeGM`;
    return this.http.delete(url);
  }

  // Group Custom Filter
  getGroupCustomFilters() {
    return this.http.get(
      this.signupApi +
        `/${this.gs.orgID}/${this.gs.user.id}/getGroupCustomFilters`
    );
  }

  fetchAgentGroups(agentID) {
    return this.http.get(
      `${this.signupApi}/getAgentGroups/${agentID}/${this.gs.org.id}`
    );
  }

  newGroupCustomFilter(payload) {
    payload = { ...payload, orgID: this.gs.orgID, userID: this.gs.user.id };
    return this.http.post(this.signupApi + `/newGroupCustomFilter`, payload);
  }

  updateGroupCustomFilter(payload) {
    payload = { ...payload, orgID: this.gs.orgID, userID: this.gs.user.id };
    return this.http.post(this.signupApi + `/updateGroupCustomFilter`, payload);
  }

  getFilteredGroups(ticketValue, resolvedValue) {
    return this.http.get(
      this.signupApi +
        `/${ticketValue}/${resolvedValue}/${this.gs.orgID}/getFilteredGroupsByNoOfTicketsAndNoOfTicketResolved`
    );
  }

  deleteGroupCustomFilter(id) {
    return this.http.delete(this.signupApi + `/${id}/deleteGroupCustomFilter`);
  }

  // Agent Custom Filter
  getAgentCustomFilters() {
    return this.http.get(
      this.signupApi +
        `/${this.gs.orgID}/${this.gs.user.id}/getAgentCustomFilters`
    );
  }

  getFilteredAgents(ticketValue, resolvedValue) {
    return this.http.get(
      this.signupApi +
        `/${ticketValue}/${resolvedValue}/${this.gs.orgID}/getFilteredAgentsByNumberOfTicketsAndTicketsResolved`
    );
  }

  newAgentCustomFilter(payload) {
    payload = { ...payload, orgID: this.gs.orgID, userID: this.gs.user.id };
    return this.http.post(this.signupApi + `/newAgentCustomFilter`, payload);
  }

  deleteAgentCustomFilter(id) {
    return this.http.delete(this.signupApi + `/${id}/deleteAgentCustomFilter`);
  }
}
