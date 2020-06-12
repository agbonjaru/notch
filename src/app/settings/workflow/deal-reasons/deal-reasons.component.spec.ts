import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DealReasonsComponent } from './deal-reasons.component';

describe('DealReasonsComponent', () => {
  let component: DealReasonsComponent;
  let fixture: ComponentFixture<DealReasonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DealReasonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DealReasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
