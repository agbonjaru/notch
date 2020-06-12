export interface TicketModel {
    agentID: any;
    agentName: string;
    clientName: string;
    clientID: number;
    createdDate: Date;
    detail: string;
    dueDate: string;
    groupID: string;
    groupName: string;
    id: number;
    lastResponse: any;
    name: string;
    orgID: string;
    priority: string;
    src: string;
    stat: string;
    subject: string;
    type: string;
    code?: string;
    notice?: number;
    closed?: boolean;
    otherData?: any
}
export interface TicketStatModel {
    "totalUnresolved": number;
    "totalOverdue": number;
    "totalOpen": number;
    "totalOnHold":  number;
    "totalUnassigned": number;
    "totalAssignedToMe": number
  }
export interface TicketFilterModel {
    "endDate": any;
    "id": string;
    "orgID": number;
    "startDate": any;
    "type": number
  }
export interface TicketChatModel {
  "agentID"?: string;
  "channel": number;
  "groupID"?: string;
  "message": string;
  "orgID"?: string;
  "sender": string;
  "subject": string;
  "ticketCode": string
}