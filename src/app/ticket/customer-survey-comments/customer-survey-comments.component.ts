import { ActivatedRoute } from '@angular/router';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-customer-survey-comments',
  templateUrl: './customer-survey-comments.component.html',
  styleUrls: ['./customer-survey-comments.component.css']
})
export class CustomerSurveyCommentsComponent implements OnInit {
  commentList: any[];
  value;
  constructor(
    private ticketSrv: TicketService,
    route: ActivatedRoute) {
      route.params.subscribe(res => {
        this.value = this.getRateValue(res.type);
        this.getCommentByRating(res.type)
      })
   }

  ngOnInit() {
  }
  getCommentByRating(rating) {
    this.ticketSrv.fetchCustomerRating(rating).subscribe((res: any) => {
      this.commentList = res;
    })
  }
  getRateValue(rating) {
    switch (Number(rating)) {
      case 100:
        return 'Great';
      case 75:
        return 'Good';
      case 50:
        return 'Okay';
      case 25:
        return 'Not Okay';
      default:
        return 'Terrible';
    }
  }

}
