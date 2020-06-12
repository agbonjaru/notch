// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// import {config } from 'dotenv';
// config();

export const environment = {
  production: false,
  notchFrontendServiceUrl: "https://test.notchcx.io",
  chatServiceUrl: "https://chat.notchcx.io",
  commandCenterUrl: "https://commandcenter.notchcx.io", 
  targetServiceUrl: "https://target.notchcx.io",
  paystackKey: "pk_test_b95be3d40e9f1c7103ae8d8f36086986173ef0d7",
  
  commsServiceUrl: "https://comms.notchcx.io",
  notificationsServiceUrl: "https://notifications.notchcx.io",
  whatsAppBot: "https://wsapp.notchcx.io",
  salesClientServiceUrl: "https://sales.notchcx.io",
  // commsServiceUrl: "http://localhost:3400",
  // notificationsServiceUrl: "http://localhost:3600",
  // salesClientServiceUrl: "http://localhost:3200",

  apiUrl: "https://test.notchcx.io:",
  localUrlJava: "http://10.10.100.39:",
  localUrlNode: "http://localhost:",
  socketUrl: "http://localhost:8080",
  emailDomain: "@app.notchcx.io",
  baseUrl: "https://test.notchcx.io",
  notchWebsite: "https://notchcx.io",
  notchAppURL: "http://localhost:4200",
};

export const Office365OuthSettings = {
  appId: "6c63c897-fadd-494b-a31e-0e9482e7c731",
  authority: "https://login.microsoftonline.com/common/",
  redirectUri: "http://localhost:4200/clients/outlook-callback",
  scopes: ["offline_access", "Mail.ReadWrite", "Mail.Send", "User.Read"],
  validateAuthority: false
};

export const GmailRedirectUri = `http://localhost:4200/clients/google-callback`;

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
