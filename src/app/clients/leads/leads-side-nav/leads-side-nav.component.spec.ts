import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsSideNavComponent } from './leads-side-nav.component';

describe('LeadsSideNavComponent', () => {
  let component: LeadsSideNavComponent;
  let fixture: ComponentFixture<LeadsSideNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadsSideNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadsSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
