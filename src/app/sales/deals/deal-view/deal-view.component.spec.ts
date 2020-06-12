import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DealViewComponent } from './deal-view.component';

describe('DealViewComponent', () => {
  let component: DealViewComponent;
  let fixture: ComponentFixture<DealViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DealViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DealViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
