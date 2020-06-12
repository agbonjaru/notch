//interceptor to manage error in API calls

import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpRequest,
} from "@angular/common/http";
import { Observable, throwError, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

declare var stopPageTransition: any;

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error) => {
        console.log(error);
        let message =
          "Something went wrong, please check your internet connection and try again";
        let status = "";
        if (error) {
          if (error.error) {
            message = error.error.message;
          } else {
            message = error.message;
          }
        }

        //handle unconfirmed email
        if (error.status === 412) {
          if (error.error) {
            status = error.error.status;
          } else {
            status = error.status;
          }
        }

        Swal.fire({
          type: "error",
          title: "Oops...",
          text: message,
        });

        console.log(error);

        // console.log(message, " SignUp Error Message");
        // if (message.includes("Email")) {
        //   Swal.fire({
        //     type: "error",
        //     title: "Oops...",
        //     text: "Email Already Exist!",
        //   });
        // } else {
        //   Swal.fire({
        //     type: "error",
        //     title: "Oops...",
        //     text: message,
        //   });
        // }

        return of(null);
      })
    );
  }
}
