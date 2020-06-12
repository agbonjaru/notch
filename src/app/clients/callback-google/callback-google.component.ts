import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-callback-google',
  templateUrl: './callback-google.component.html',
  styleUrls: ['./callback-google.component.css']
})

export class CallbackGoogleComponent implements OnInit {
  query_params: object = {};
  oauth_details: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const redirect_uri = this.getRedirectUri();
    this.extractQueryParams();

    localStorage.setItem('token_response', JSON.stringify(this.query_params));
    this.router.navigate([redirect_uri]);
  }

  getRedirectUri() {
    const redirect_uri = localStorage.getItem('redirect_uri');
    if (typeof redirect_uri === 'string' && redirect_uri.length > 1) {
      return redirect_uri;
    }

    return '/clients';
  }

  extractQueryParams() {
    this.route.queryParams.subscribe(params => {
      this.query_params = {
        ...params
      };
    });
    delete this.query_params['scope'];
    this.query_params['client'] = 'google';
  }
}
