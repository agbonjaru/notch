import { environment } from "./../../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class Endpoints {
  localUrlNode = environment.localUrlNode;
  public notchFrontendServiceUrl = environment.notchFrontendServiceUrl;
  public chatServiceUrl = environment.chatServiceUrl;
  public commandCenterUrl = environment.commandCenterUrl;
  public commsServiceUrl = environment.commsServiceUrl;
  public notificationsServiceUrl = environment.notificationsServiceUrl;
  public salesClientServiceUrl = environment.salesClientServiceUrl;
  public targetServiceUrl = environment.targetServiceUrl;
  public whatsAppUrl = environment.whatsAppBot

  public apiUrl = environment.apiUrl;
  public javaApi = environment.localUrlJava;
  public clientsAndSalesServiceLocalUrl = `${this.salesClientServiceUrl}`;
  public subscriptionQuotationInvoiceEndpoint = `${this.salesClientServiceUrl}`;
  public leadsCompaniesContactClientsEndpoint = `${this.salesClientServiceUrl}`;
  public communicationsEndpoint = `${this.commsServiceUrl}`;
  public fourFourSixEndpoint = `${this.salesClientServiceUrl}`;
  public fourFourEightEndpoint = `${this.targetServiceUrl}`;
  public javaHostUrl = `${this.apiUrl}8080`;
  public userUrl = `${this.apiUrl}8080`;
  public signUpEndpoint = `${this.apiUrl}8080/signup`;
  public organizationEndpoint = `${this.apiUrl}8080/signup`;
  public settingsUrl = `${this.apiUrl}8080`;
  public logActivityUrl = `${this.apiUrl}8080/Activity`;

  constructor(private http: HttpClient) {}

  public analyticsUrl = `${this.apiUrl}8080/notch_analytics`;
  public signupUrl = `${this.apiUrl}8080/signup`;
  public salesServiceUrl = `${this.apiUrl}8080/salesservice`;
  public salesUrl = `${this.apiUrl}8080/salesservice`;
  public ticketUrl = `${this.apiUrl}8080/ticketservice`;
  public settingsApi = `${this.apiUrl}8080/settingsservice`;
  public adminUrl = `${this.apiUrl}8080/adminservice`;
  public adminserviceUrl = `${this.apiUrl}8080/adminservice`;

  public signUpApis = {
    createUser: "/createUser",
    getAllUsers: "/alluser",
    getOneUser: "/oneuser",
  };

  public subscriptions = {
    createGetOneUpdateDeleteSubscriptions: "/subscriptions/",
    subscriptionFilter: "/subscriptions/filter",
  };

  public invoice = {
    createGetOneUpdateDeleteInvoice: "/invoices/",
    getAllByPaginationInvoice: "/invoices/filter?page=0&population=20",
    filterInvoice: "/invoices/filter",
  };

  public clients = {
    getOneGetAllClients: "/clients/",
    mergeCompanyContact: "/clients/merger",
    // getAllByPaginationClients: "/clients/filter?page=0&population=20",
    filterClients: "/clients/filter",
  };

  public leads = {
    baseUrl: "leads",
    filterUrl: "leads/filter",
  };

  public customFilter = {
    createGetUpdateDeleteCustomFilter: "/filters",
    baseUrl: "leads",
    filterUrl: "leads/filter",
  };

  public filters = {
    baseUrl: "filters",
    filterUrl: "filters/filter",
  };

  public leadSources = {
    baseUrl: "organisation-lead-sources",
    filterUrl: "organisation-lead-sources/filter",
    filterLeadUrl: "leads/filter",
  };

  public bankAccounts = {
    baseUrl: "bank-accounts",
    filterUrl: "bank-accounts/filter",
  };

  public companies = {
    createGetOneUpdateDeleteCompanies: "/companies/",
    getAllByPaginationCompanies: "/companies/filter?page=0&population=20",
    filterCompanies: "/companies/filter",
    wildCardCompanies: "/companies/wildcard/",
    addContactToCompany: "/companies/contact",
    getSalespersonTeams: "/getSalespersonTeams",
    getSupervisorTeams: "/getSupervisorTeams",
    countTeamsSalesperson: "/Table",
  };

  public phoneCall = {
    getNumber: "/profile/",
    addNumber: "/number/add",
    updateNumber: "/number/",
    deleteNumber: "/number/delete/",
    makeACall: "/calls",
  };

  public contactCompanyImage = {
    getPostImage: "/files",
  };

  public contacts = {
    createGetOneUpdateDeleteContacts: "/contacts/",
    getAllByPaginationContacts: "/contacts/filter?page=0&population=20",
    filterContacts: "/contacts/filter",
    addCompanyToContact: "/contacts/company",
  };

  public payment = {
    createGetOneUpdateDeletePayment: "/payments/",
    getAllByPaginationPayment: "/payments/filter?page=0&population=20",
    filterPayment: "/payments/filter",
  };

  public quotations = {
    createQuotations: "/quotations/",
    getQuotations: `/quotations/filter?page=0&population=20`,
    getOneQuotation: "/quotations/",
    filterQuotation: "/quotations/filter",
    updateQuotation: "/quotations/",
    deleteQuotation: "/quotations/",
  };

  public organization = {
    createOrg: "/addOrganization",
    getAllOrg: "/organization_list",
    deleteOrg: "/:organizationName",
    getUerByOrg: "/getUsersInOrganization",
  };

  public roles = {
    baseurl: "/signup",
    get: "/getRoles",
    new: "/newRole",
    delete: "/deleteRole",
    byId: "/getRolesByName",
    edit: "/editRole",
  };

  public permissions = {
    baseurl: "/signup",
    get: "/getPriviledges",
    ByStatus: "/getPriviledgesByStatus",
  };

  public category = {
    baseurl: "/settingsservice",
    getCategoryByCompany: "/getCategoriesByCompany",
    getProductsServicesByCategory: "/getProductsServicesByCategory",
    get: "/getCategories",
    new: "/newCategory",
    edit: "/editCategory",
    // "delete": "/deleteRole",
  };

  public product = {
    baseurl: "/settingsservice",
    getProductsByCompany: "/getProductsByCompany",
    new: "/newProductService",
    edit: "/editProductService",
    get: "/getProductsServices",
    delete: "/deleteProductService",
  };

  public leadsCustomers = {
    baseurl: "/settingsservice",
    get: "/getSources",
    new: "/newSource",
    delete: "/deleteSource",
    edit: "/editSource",
  };

  public salesTerritory = {
    baseurl: "/settingsservice",
    get: "/getSalesTerritories",
    getByCategory: "/getSalesTerritoriesByCategory",
    new: "/newSalesTerritory",
    delete: "/deleteSalesTerritory",
    edit: "/editSalesTerritory",
  };

  public salesCompetitors = {
    baseurl: "/settingsservice",
    get: "/getSalesCompetitor",
    getByCompany: "/getSalesCompetitorByCompany",
    new: "/newSalesCompetitor",
    delete: "/deleteSalesCompetitor",
    edit: "/editSalesCompetitor",
  };

  public message = {
    baseurl: "/settingsservice",
    byCategory: "/getMessageTemplatesByCategory",
    new: "/newMessageTemplates",
    delete: "/deleteMessageTemplate",
    byId: "/getMessageTemplatesById",
    edit: "/editMessageTemplates",
    clone: "/cloneMessageTemplates",
  };

  public notification = {
    baseurl: "/settingsservice",
    byRoleName: "/getMakerCheckersByRoleName",
    new: "/newMakerChecker",
    edit: "/editMakerChecker",
    update: "/editMakerChecker",
  };

  public twoFactorAuth = {
    baseurl: "/settingsservice",
    save: "/saveTwoFactorAuth",
    byCompany: "/getTwoFactorAuthByCompany",
    byRole: "/getTwoFactorAuthByRoleName",
  };

  public ticketBulk = {
    baseurl: "/settingsservice",
    save: "/saveIntegration",
    byCompany: "/getIntegrationsByCompany",
  };

  public userRole = {
    baseurl: "/signup",
    invite: "/inviteUser",
  };

  public topUp = {
    baseUrl: "/integrationservice",
    pay: "/atb/v1/paystack/initializePayment/",
    verify: "/atb/v1/paystack/verifyPayment",
    activate: "/atb/v1/sms/subscription/activate/",
    buyUnits: "/saveTwoFactorSMS",
  };

  public sequencing = {
    baseurl: "/settingsservice",
    new: "/newEmailSequence",
    edit: "/editEmailSequence",
    getByOrg: "/getEmailSequencesByCompany",
    getByName: "/getEmailSequencesByName",
    delete: "/deleteEmailSequenceTemplate",
    clone: "/cloneEmailSequence",
  };

  public mailSequencing = {
    baseurl: "/settingsservice",
    new: "/newMailSequence",
    edit: "/editMailSequence",
    getByParentId: "/getMailSequenceByParent",
    getById: "/getMailSequence",
  };

  public generalApproval = {
    baseurl: "/settingsservice",
    new: "/newGeneralApproval",
    edit: "/editGeneralApproval",
    getByName: "/getGeneralApproval",
    allApproval: "/getAllApprovals",
  };

  public dealPipeLineWorkflow = {
    baseurl: "/settingsservice",
    newDealsPipelineWorkflow: "/newDealsPipelineWorkflow",
    newDealsPipelineStage: "/newDealsPipelineStage",
    getDealsPipelineWorkflows: "/getDealsPipelineWorkflows",
    getDealsPipelineWorkflowById: "/getDealsPipelineWorkflow",
    getDealsPipelineStageById: "/getDealsPipelineStage",
    deleteDealsPipelineWorkflowById: "/deleteDealsPipelineWorkflow",
    deleteDealsPipelineStageById: "/deleteDealsPipelineStage",
    getDealsPipelineStagesByDealId: "/getDealsPipelineStages",
    editDealsPipelineWorkflow: "/editDealsPipelineWorkflow",
    editDealsPipelineStages: "/editDealsPipelineStage",
  };

  public deal = {
    create: "/newDeal",
  };

  public salesOrderWorkflow = {
    baseurl: "/settingsservice",
    newWorkflow: "/newWorkflow",
    newTransition: "/newTransition",
    newStage: "/newStage",
    editWorkflow: "/editWorkflow",
    editTransition: "/editTransition",
    editStage: "/editStage",
    getCurrTransitionStages: "/getCurrTransitionStages",
    getWorkflows: "/getWorkflows",
    getStages: "/getStages",
    getTransitions: "/getTransition",
    getWorkflowsById: "/getWorkflow",
    getStagesById: "/getStages",
    getTransitionsById: "/getTransitions",
    deleteWorkflowsById: "/deleteWorkflow",
    deleteStagesById: "/deleteStage",
    deleteTransitionsById: "/deleteTransition",
  };

  public creditProfile = {
    createGet: "/creditProfile",
    update: "/creditProfile/update/{id}",
    delete: "/creditProfile/delete/{creditProfileID}",
    createClient: "/creditProfile/client",
    getClient: "/clients/{creditProfileID}",
    deleteClient: "/client/{clientID}/{creditProfileID}",
  };

  create(apiUrl, credentials) {
    try {
      return this.http.post(`${this.javaHostUrl}${apiUrl}`, credentials);
    } catch (error) {
      alert(error);
    }
  }

  fetch(apiUrl) {
    try {
      return this.http.get(`${this.javaHostUrl}${apiUrl}`);
    } catch (error) {
      alert(error);
    }
  }

  update(apiUrl, payload) {
    try {
      return this.http.put(`${this.javaHostUrl}${apiUrl}`, payload);
    } catch (error) {
      alert(error);
    }
  }

  filter(apiUrl, params) {
    try {
      return this.http.get(`${this.javaHostUrl}${apiUrl}${params}`);
    } catch (error) {
      alert(error);
    }
  }

  delete(apiUrl, selector) {
    try {
      return this.http.delete(`${this.javaHostUrl}${apiUrl}/${selector}`);
    } catch (error) {
      alert(error);
    }
  }

  public target = {
    addPeriod: "/periods",
    getPeriods: "/periods",
    updatePeriod: "/period/update/",
    deletePeriod: "/period/delete/",
    getSubPeriods: "/period/sub_periods/",
    addTarget: "/targets",
    getTargets: "/targets",
    updateTarget: "/target/update/",
    deleteTarget: "/target/delete/",
    getTargetLists: "/user/targets-list/",
    getTargetLimit: "/user/target/limit/",
    getTargetPeriods: "/target/sub_periods/",
    getAssignedPeriods: "/user/user-assigned-period/",
    addAssignedTarget: "/user/user-targets",
    getAssignedTargets: "/user/user-targets/",
    getAssignedTargetsV2: "/user/user-assigned-target/",
    deleteAssignedTarget: "/user/user-targets/",
    addAssignedTeamTarget: "/user/team/targets",
    getAssignedTeamTargets: "/user/team/targets/",
    deleteAssignedTeamTarget: "/user/team/targets/",
    getCommissions: "/user/commissions-list/",
    addAssignedCommission: "/user/user-commissions",
    getAssignedCommissions: "/user/user-commissions/",
    deleteAssignedCommission: "/user/user-commissions/",
    addCommissionProfile: "/commissions",
    getCommissionProfiles: "/commissions",
    updateCommissionProfile: "/commission/update/",
    deleteCommissionProfile: "/commission/delete/",
    getCommittals: "/user/committals/",
    addCommissionPayment: "/user/commission/payments",
    getCommissionPayments: "/user/commission/payment-history/",
    reverseCommissionPayment: "/user/application/commission-payment-reversal/",
    addCommissionProcess: "/user/commission/processes",
    getCommissionProcesses: "/user/commission/processes/",
    reverseCommissionProcess: "/user/application/commission-process-reversal/",
    addTargetFilter: "/filter/create",
    getTargetFilters: "/filters/get",
    updateTargetFilter: "/filter/update/",
    deleteTargetFilter: "/filter/delete/",
  };

  public task = {
    getClientPendingTasks: "/tasks/pending/",
  };

  public currency = {
    getOrgCurrency: "/getOrgCurrencies",
  };

  public templates = {
    getTemplates: /templates/,
  };
}
