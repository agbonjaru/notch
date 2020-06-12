import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfficeService } from 'src/app/services/integrations/email/office.service';

@Component({
  selector: 'app-callback-outlook',
  templateUrl: './callback-outlook.component.html',
  styleUrls: ['./callback-outlook.component.css']
})

export class CallbackOutlookComponent implements OnInit {
  query_params: object = {};
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private officeService: OfficeService
  ) { }

  ngOnInit() {
    const redirect_uri = this.getRedirectUri();
    
    //
  }

  getRedirectUri() {
    const redirect_uri = localStorage.getItem('redirect_uri');
    if (typeof redirect_uri === 'string' && redirect_uri.length > 1) {
      return redirect_uri;
    }

    return '/clients';
  }
}
