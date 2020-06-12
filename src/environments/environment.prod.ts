// import * as jwt from 'jsonwebtoken';
export const environment = {
  production: true,
  notchFrontendServiceUrl: "https://test.notchcx.io",
  chatServiceUrl: "https://chat.notchcx.io",
  commandCenterUrl: "https://commandcenter.notchcx.io", 
  commsServiceUrl: "https://comms.notchcx.io",
  notificationsServiceUrl: "https://notifications.notchcx.io",
  salesClientServiceUrl: "https://sales.notchcx.io",
  targetServiceUrl: "https://target.notchcx.io",
  whatsAppBot: "https://wsapp.notchcx.io",
  paystackKey: "pk_test_b95be3d40e9f1c7103ae8d8f36086986173ef0d7",

  apiUrl: "https://test.notchcx.io:",
  localUrl: "http://10.10.100.79:",
  localUrlJava: "http://10.10.100.79:",
  localUrlNode: "http://localhost:",
  socketUrl: "https://notch-chat-bot.herokuapp.com",
  emailDomain: "@app.notchcx.io",
  baseUrl: "https://test.notchcx.io",
  notchWebsite: "https://notchcx.io",
  notchAppURL: "https://test.notchcx.io",
};

export const Office365OuthSettings = {
  appId: "6c63c897-fadd-494b-a31e-0e9482e7c731",
  authority: "https://login.microsoftonline.com/common/",
  redirectUri: "https://test.notchcx.io/clients/outlook-callback",
  scopes: ["offline_access", "Mail.ReadWrite", "Mail.Send", "User.Read"],
};

export const GmailRedirectUri = `https://test.notchcx.io/clients/google-callback`;