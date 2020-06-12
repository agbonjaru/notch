import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPerformanceComponent } from './group-performance.component';

describe('GroupPerformanceComponent', () => {
  let component: GroupPerformanceComponent;
  let fixture: ComponentFixture<GroupPerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupPerformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
