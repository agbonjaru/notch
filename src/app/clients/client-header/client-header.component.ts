import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-client-header',
  templateUrl: './client-header.component.html',
  styleUrls: ['./client-header.component.css'],
})
export class ClientHeaderComponent implements OnInit {
  constructor(
    public router: Router,
    public gs: GeneralService) {}

  ngOnInit() {}
}
