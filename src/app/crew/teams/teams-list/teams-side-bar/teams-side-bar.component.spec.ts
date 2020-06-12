import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsSideBarComponent } from './teams-side-bar.component';

describe('TeamsSideBarComponent', () => {
  let component: TeamsSideBarComponent;
  let fixture: ComponentFixture<TeamsSideBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsSideBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
