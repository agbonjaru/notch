export class GeneralTaskModel {
    taskName: string;
    remindDate: Date;
    remindTime: Date;
    remindDay: Date;
    category: string;
    channel: string;
    taskDescription: string;
    creatorUserID: string;
    assignedUserID: string;
    orgID: string;
    taskID: string;
  }

  export class ClientTaskModel {
    taskName: string;
    remindDate: Date;
    remindTime: Date;
    remindDay: Date;
    category: string;
    channel: string;
    taskDescription: string;
    creatorUserID: string;
    assignedUserID: string;
    associatedClientID: string;
    selectedDeal: string;
    selectedDealCode: string;
    orgID: string;
    taskID: string;
    id: string;
    taskDeal: string;
    taskDealName: string;
  }