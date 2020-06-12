import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewSidebarComponent } from './crew-sidebar.component';

describe('SidebarComponent', () => {
  let component: CrewSidebarComponent;
  let fixture: ComponentFixture<CrewSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrewSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrewSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
