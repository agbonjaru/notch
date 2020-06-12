import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, } from 'rxjs';
import { Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';
import { ClientTaskService } from 'src/app/services/task/client-task.service';

@Component({
  selector: 'app-task-feeds',
  templateUrl: './task-feeds.component.html',
  styleUrls: ['./task-feeds.component.css']
})
export class TaskFeedsComponent implements OnInit {

  loadedTasks: any = [];
  currentClientID: string = '';
  task: any = {};

  constructor(
    private router: Router,
    private http: HttpClient,
    private gs: GeneralService,
    private clientTaskSrv: ClientTaskService
    ) { }

  ngOnInit() {
    this.FetchAllClientTasks();
  }

  public getCurrentClientID() {
    this.currentClientID =  this.router.url.split('/').pop();
  }

  onMarkTaskAsCompleted(id) {
    alert(id);
    this.markTaskAsCompleted(id);
  }

  private markTaskAsCompleted(id) {
    this.clientTaskSrv.markTaskAsCompleted(id)
    .subscribe(data => {
      this.FetchAllClientTasks()
      console.log('task status update successfully', data)
    }, error => {this.gs.handleError(error)});
  }

  // private FetchTasks() {
  //   this.http.get('http://localhost:3000/tasks')
  //   .pipe(map(tasksData => {

  //   }))
  //   .subscribe(tasks => {
  //     console.log(tasks);
  //   })

  private FetchAllClientTasks() {
    this.clientTaskSrv.getAllClientTasks()
    .subscribe(allClientTasks => {
      this.loadedTasks = allClientTasks;
      this.loadedTasks = this.loadedTasks.filter(x => x.associatedClientID == this.currentClientID);
    })
  }

}
