import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsSubNavComponent } from './teams-subnav.component';

describe('TeamsSubNavComponent', () => {
  let component: TeamsSubNavComponent;
  let fixture: ComponentFixture<TeamsSubNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamsSubNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamsSubNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
