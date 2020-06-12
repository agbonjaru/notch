export class DealModel {
  amount: string;
  closeDate: Date;
  code?: string;
  displayCode?: string;
  status?: number;
  currency?: string;
  clientID?: string;
  clientName: any;
  clientEmail: string;
  salesCompetitors: any[];
  products: any[];
  creatorID?: string;
  contacts: [{id: string; name: string, email: string}];
  currStage: string;
  hasQuote?: boolean;
  name: string;
  orgID?: string;
  productID?: string;
  productName: string;
  profileScore?: string;
  salesProcessID?: string;
  salesProcessName: string;
  source?: string;
  stageID: string;
  teamID?: string;
  winningProb?: string;
  createdDate?: Date;
  forecastAmount?: number;
  forecastDate?: Date;
  client?: any;
  comment?: string
}

export class DealFilterModel {
    "clientID": string;
    "clientName": string;
    "clientType": string;
    "dealOwnerID": number;
    "dealOwnerName": string;
    "dealValueFrom": number;
    "dealValueTo": number;
    "id"?: number;
    "name": string;
    "orgID"?: string;
    "teamID"?: string;
}
