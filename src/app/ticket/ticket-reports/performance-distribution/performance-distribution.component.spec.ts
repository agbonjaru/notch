import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceDistributionComponent } from './performance-distribution.component';

describe('PerformanceDistributionComponent', () => {
  let component: PerformanceDistributionComponent;
  let fixture: ComponentFixture<PerformanceDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
