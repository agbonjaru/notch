import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkMessagesComponent } from './bulk-messages.component';

describe('BulkMessagesComponent', () => {
  let component: BulkMessagesComponent;
  let fixture: ComponentFixture<BulkMessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkMessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
