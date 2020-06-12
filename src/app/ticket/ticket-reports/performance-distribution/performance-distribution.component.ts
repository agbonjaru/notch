import { ReportService } from './../../../services/ticket/report.service';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-performance-distribution',
  templateUrl: './performance-distribution.component.html',
  styleUrls: ['./performance-distribution.component.css']
})
export class PerformanceDistributionComponent implements OnInit {
  perDistList$: Observable<any[]>;
  constructor(private reportSrv: ReportService) {
    this.perDistList$ = (this.reportSrv.fetchPerDist() as any);
  }

  ngOnInit() {
  }

  getFilter(filter) {
    this.perDistList$ = null;
    this.perDistList$ = (this.reportSrv.fetchPerDist(filter) as any);
  }

  


}
