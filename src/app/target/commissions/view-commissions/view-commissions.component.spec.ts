import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCommissionsComponent } from './view-commissions.component';

describe('ViewCommissionsComponent', () => {
  let component: ViewCommissionsComponent;
  let fixture: ComponentFixture<ViewCommissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCommissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCommissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
