import { Component, OnInit, Input, AfterViewInit } from "@angular/core";
import { LeadWorkflowService } from "src/app/services/client-services/lead-workflow.service";
import $ from "jquery";
import { LeadService } from "src/app/services/client-services/leads.service";

@Component({
  selector: "app-lead-workflow-item",
  templateUrl: "./lead-workflow-item.component.html",
  styleUrls: ["./lead-workflow-item.component.css"]
})
export class LeadWorkflowItemComponent implements OnInit, AfterViewInit {
  @Input() item: any;
  isDone: boolean = false;
  updateMessage: string = "";
  startTime: string = "";
  duration: string = "";

  constructor(
    private leadService: LeadService,
    private leadWorkflowService: LeadWorkflowService
  ) { }

  ngOnInit() {
    if (this.item) {
      this.startTime = this.getTimeFromDate(this.item.startTime);
      this.duration = this.formatDuration(this.item.duration);
      this.isDone = this.item.isDone;

      if (this.item.convertsToClient) {
        this.leadService.markLeadAsConvertible(this.isDone);
      }
    }
  }

  ngAfterViewInit() {
    this.toggleSpan(this.isDone);
  }

  updateWorkflow() {
    const leadInfo = this.leadService.getLeadInfo();
    //
    const startTime = leadInfo.lastWorkflowTime;
    const currentTime = Math.floor(Date.now() / 1000);
    //
    // if (this.actionIsValid(nextWorkflowId, prevWorkflowId)) {
    this.updateMessage = " - updating...";

    //
    const currentItem = this.leadWorkflowService.getWorkflowItem(this.item.id);
    const updateDataForCurrentItem = {
      ...currentItem,
      duration: currentTime - startTime,
      endTime: currentTime,
      isDone: !this.isDone
    };

    //
    this.leadWorkflowService.updateLeadWorkflow(updateDataForCurrentItem).subscribe(res => {
        this.updateMessage = "";
        if (res.success) {
          this.isDone = !this.isDone;
          this.item = { ...res.payload };
          this.duration = this.formatDuration(this.item.duration);
          this.leadWorkflowService.setWorkflowStat(this.item.id, this.isDone);
          this.leadWorkflowService.updateWorkflow(this.item.id, res.payload);
          this.toggleSpan(this.isDone);

          if (this.item.convertsToClient) {
            this.leadService.markLeadAsConvertible(this.isDone);
          }


          this.leadService.updateLead({
            ...leadInfo,
            lastWorkflowTime: currentTime
          }).subscribe(res => {
            if (res.success) {
              this.leadService.local_lead_info.next(res.payload);
            }
          }, error => {
            console.log(error.message);
          });
        }
      }, error => {
        console.log(error.message);
        this.updateMessage = "";
      });
  }

  formatDuration(duration) {
    duration = Number(duration);

    //
    if (duration < 60) {
      return `${duration}s`;
    }

    if (duration < 3600) {
      return `${Math.round(duration / 60)}m`;
    }

    if (duration < 86400) {
      return `${Math.round(duration / 3600)}h`;
    }

    return `${Math.round(duration / 86400)}d`;
  }
  pad(num) {
    return ("0" + num).slice(-2);
  }

  getTimeFromDate(timestamp) {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    return this.pad(hours) + ":" + this.pad(minutes) + ":" + this.pad(seconds);
  }

  isLastWorkFlowItem(nextWorkflowId) {
    return nextWorkflowId === "" || nextWorkflowId === undefined;
  }

  workflowHasNotStarted(prevWorkflowId) {
    return prevWorkflowId === null && !this.leadWorkflowService.getIsStarted();
  }

  actionIsValid(nextWorkflowId, prevWorkflowId) {
    return (
      (this.isDone &&
        !this.leadWorkflowService.checkIfItemIsDone(true, nextWorkflowId)) ||
      (!this.isDone &&
        this.leadWorkflowService.checkIfItemIsDone(false, prevWorkflowId))
    );
  }

  /** */

  toggleSpan(value) {
    let color = "";
    if (value) {
      color = "#009DFF";
    } else {
      color = "#ffffff";
    }

    //
    $(`#${this.item.id}`).css("background-color", color);
  }
}
