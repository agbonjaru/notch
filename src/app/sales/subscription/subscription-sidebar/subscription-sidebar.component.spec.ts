import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSidebarComponent } from './subscription-sidebar.component';

describe('SubscriptionSidebarComponent', () => {
  let component: SubscriptionSidebarComponent;
  let fixture: ComponentFixture<SubscriptionSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
