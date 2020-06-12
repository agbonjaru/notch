export class SalesOrderModel {
  "clientID": string;
  "clientName": string;
  "source": string;
  "creatorID": string;
  "code"?: string;
  "status": number;
  "displayCode"?: string;
  "dealCode"?: string;
  "createdDate"?: Date;
  "currency": string;
  "orgID": string;
  "salesOrderItems": [
    {
      amount: number;
      descrip: string;
      id: number;
      markUp: string;
      markUpType: string;
      productID: string;
      productName: string;
      quantity: number;
      taxAmount: number;
      taxName: string;
      unitPrice: number;
    }
  ];
  "stageID": string;
  "stageName": string;
  "subTotalAmount": number;
  "taxAmount": number;
  "teamID": string;
  "totalAmount": number;
  "transitionID": string;
  "transitionName": string;
  "workflowID": string;
  "workflowName": string;
}
export class SalesTransitionModel {
  "id"?: string;
  "orgID"?: string;
  "name": string;
  "salesOrderID": number;
  "roleName": string;
  "number": string;
  "startStageID": number;
  "startStageName": string;
  "documents"?: any;
  "stages": [
    {
      id: string;
      stageID: number;
      stageName: string;
    }
  ];
}

export class SalesTransitionModel2 {
  documents: [];
  id: number;
  name: string;
  number: string;
  orgID: string;
  roleName: [];
  salesOrderID: number;
  stages: Array<any>;
  startStageID: number;
  startStageName: string;
}

export class TransitionStageModel {
  "transitionName": string;
  "transitionID": string;
  "lastTransition": number;
  "startStageName": string;
  "roleNames": [any];
  "startStageID": number;
  "forwardStages": [
    {
      id: number;
      stageID: number;
      stageName: string;
    }
  ];
  "backwardStages": [
    {
      id: number;
      stageID: number;
      stageName: string;
    }
  ];
}
