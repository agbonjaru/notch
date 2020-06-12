import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionProfilesComponent } from './commission-profiles.component';

describe('CommissionProfilesComponent', () => {
  let component: CommissionProfilesComponent;
  let fixture: ComponentFixture<CommissionProfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommissionProfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
