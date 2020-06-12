import { Store } from "@ngrx/store";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { Observable } from "rxjs";

import { GeneralService } from "../services/general.service";
import { AppState } from "../store/app.state";

@Injectable()
export class AuthcrudInterceptorService implements HttpInterceptor, OnInit {
  token: string;
  orgId;
  constructor(private genSer: GeneralService, store: Store<AppState>) {
    store.select("userInfo").subscribe((info) => {
      this.orgId = info.organization.id;
      this.token = info.token;
    });
    // this.token = this.genSer.token ? this.genSer.token : "";
    // this.orgId = this.genSer.orgID ? this.genSer.orgID : "";
  }

  ngOnInit() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.includes("notchcx") || req.url.includes("localhost")) {
      req = req.clone({
        setHeaders: {
          orgId: `orgId ${this.orgId}`,
          authorization: `Bearer ${this.token}`,
          // 'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return next.handle(req);
  }
}
