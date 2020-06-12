import { Endpoints } from 'src/app/shared/config/endpoints';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-customer-survey',
  templateUrl: './customer-survey.component.html',
  styleUrls: ['./customer-survey.component.css']
})
export class CustomerSurveyComponent implements OnInit {
  apiUrl = this.endPoint.ticketUrl + '/saveCustomerSatisfaction';
  ticketCode;
  feedbackMsgList = {
    '100' : 'GREAT: Wow. This means a lot to us. Is there anything you would like us to do better?',
    '75': 'GOOD: We are glad you enjoyed this service. Please tell us how we can exceed your expectation',
    '50': 'OKAY: Thank you for your feedback. Please tell us what we can do differently to earn a more exciting smiley from you.',
    '25': 'BAD: We are sorry you didnt enjoy this service. Please tell us how we can improve on this',
    '0': 'TERRIBLE: Ouch. We are sorry you had an unpleasant experience. Please tell us how we can serve you better'
  }
  message = ''
  rate: string;
  feedback = ''
  loading = false;
  submitted = false
  constructor(
    route: ActivatedRoute,
    private http: HttpClient,
    private endPoint: Endpoints) {
    route.params.subscribe(res => {
      this.ticketCode = res.ticketCode
    })
   }

  ngOnInit() {
  }
  choseRate(rate) {
    this.rate = rate;
    this.message = this.feedbackMsgList[rate];
  }
  submit() {
    const body = {ticketCode: this.ticketCode, rating: this.rate, message: this.feedback}
    this.loading = true;
    this.http.post(this.apiUrl, body).subscribe(res => {
      this.loading = false;
      this.submitted = true;
    }, () => {
      this.loading = false;
    })
  }
}
