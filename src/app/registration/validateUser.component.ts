import { OnInit, Component } from "@angular/core";
import { StandaloneSignupService } from "./services/standalone-signup.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "validate-user",
  template: ``,
})
export class ValidateUserComponent implements OnInit {
  constructor(
    private singUpService: StandaloneSignupService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    let userID = this.route.snapshot.queryParams["ref"];

    this.singUpService.validateUser(userID).subscribe((resp: any) => {
      if (resp.status === "SUCCESS") {
        console.log(resp);
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ id: Number(userID) })
        );
        this.router.navigate(["/reg/org"]);
      }
    });
  }
}
