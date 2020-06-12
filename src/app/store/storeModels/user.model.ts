export interface AllUserInfoModel {
  token: string;
  user: UserModel;
  organization: OrgModel;
  priviledges: string[];
  roleName: string;
}
export interface UserModel {
  city: string;
  country: string;
  dateOfBirth: string;
  email: string;
  emailConfirm: boolean;
  firstName: string;
  id: number;
  lastName: string;
  mobileNo: string;
  password: string;
  phoneNo: string;
  state: string;
  street: string;
  token: string;
  website: string;
  teamID?: string;
  groupID?: string;
  groupName?: string;
  userImg?: string;
}
export interface OrgModel {
  city: string;
  country: string;
  currencyCode: string;
  currencyType: string;
  dateOfEstablishment: string;
  id: number;
  email: string;
  industry: string;
  mobile: string;
  name: string;
  orgName: string;
  phone: string;
  state: string;
  street: string;
  taxName: string;
  taxPercentage: string;
  userID: number;
  website: string;
  orgImg?: string;
  plan: string;
  baseCurrency?: string;
  requireCreditProfile?: boolean;
  modules: any;
  termsAndConditions: string;
  rates: { rate: number; baseCurrency: string; otherCurrency: string }[];
}
