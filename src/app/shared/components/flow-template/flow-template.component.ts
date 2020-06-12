import {
  Component,
  OnInit,
  Input,
  ElementRef,
  Output,
  EventEmitter,
} from "@angular/core";

@Component({
  selector: "flow-template",
  templateUrl: "./flow-template.component.html",
  styleUrls: ["./flow-template.component.css"],
})
export class FlowTemplateComponent implements OnInit {
  @Input() options: any;
  @Input() id: boolean;
  @Output() feedback: EventEmitter<any> = new EventEmitter<any>(null);

  private element: any;

  constructor(private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit() {
    // add transition on open
    document.querySelector(".ft-overlay-container").classList.add("open");

    // ensure id attribute exists
    // if (!this.id) {
    //   console.error("modal must have an id");
    //   return;
    // }

    // move element to bottom of page (just before </body>) so it can be displayed above everything else
    // document.body.appendChild(this.element);

    // close modal on background click
    this.element.addEventListener("click", (el) => {
      if (el.target.className === "ft-overlay-container") {
        this.close();
      }
    });
  }

  openModal(id: string) {
    // this.modalService.open(id);
  }

  // open modal
  open(): void {
    this.element.style.display = "block";
    document.body.classList.add("ft-overlay-open");
  }

  // close modal
  close(): void {
    document.querySelector(".ft-overlay-container").classList.add("close");
    this.feedback.emit({ action: "close", id: false });
  }

  // // close modal
  // close(): void {
  //   this.element.style.display = "none";
  //   document.body.classList.remove("ft--overlay");
  // }
}
