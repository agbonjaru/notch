import { SharedModule } from "./shared/shared.module";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule, AppPreloadingStrategy } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthcrudInterceptorService } from "./auth/auth-crud-interceptor.service";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { environment } from "../environments/environment"; // Angular CLI environment

import { AiComponent } from "./layouts/ai/ai.component";
import { HeaderComponent } from "./layouts/header/header.component";
import {
  invoiceReducer,
  invoiceSelectedReducer,
} from "./store/reducers/invoice.reducer";
import { subscriptionReducer } from "./store/reducers/subscription.reducer";
import { userReducer } from "./store/reducers/user.reducer";

import { CustomerSurveyComponent } from "./customer-survey/customer-survey.component";

// ANGULAR OFFICE 365
import { MsalModule } from "@azure/msal-angular";
import { Office365OuthSettings } from "../environments/environment";
import { AccessDeniedComponent } from "./access-denied/access-denied.component";
import { SettingsGuard } from "./settings/settings.guard";
import { NgxSpinnerModule } from "ngx-spinner";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { ToastrModule } from "ngx-toastr";
import { CurrencyPipe } from "@angular/common";

/** */
export const protectedResourceMap: [string, string[]][] = [
  ["https://graph.microsoft.com/v1.0/me", ["user.read"]],
];
const isIE =
  window.navigator.userAgent.indexOf("MSIE ") > -1 ||
  window.navigator.userAgent.indexOf("Trident/") > -1;

// Modules
@NgModule({
  declarations: [AppComponent, CustomerSurveyComponent],

  imports: [
    BrowserModule,
    FormsModule,
    SharedModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    StoreModule.forRoot({
      invoice: invoiceReducer,
      subscription: subscriptionReducer,
      selectedInvoice: invoiceSelectedReducer,
      userInfo: userReducer,
    }),
    // Instrumentation must be imported after importing StoreModule (config is optional)
    // StoreDevtoolsModule.instrument({
    //   maxAge: 25, // Retains last 25 states
    //   logOnly: environment.production, // Restrict extension to log-only mode
    // }),
    // Microsoft Azure
    MsalModule.forRoot(
      {
        auth: {
          clientId: Office365OuthSettings.appId,
          authority: Office365OuthSettings.authority,
          validateAuthority: true,
          redirectUri: Office365OuthSettings.redirectUri,
          navigateToLoginRequestUrl: true,
        },
        cache: {
          cacheLocation: "localStorage",
          storeAuthStateInCookie: isIE, // set to true for IE 11,
        },
      },
      {
        popUp: !isIE,
        consentScopes: Office365OuthSettings.scopes,
        extraQueryParameters: {}
      }
    ),
    ToastrModule.forRoot({
      timeOut: 10000,
      preventDuplicates: true,
    }),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
  ],

  providers: [
    AppPreloadingStrategy,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthcrudInterceptorService,
      multi: true,
    },
    SettingsGuard,
    CurrencyPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
