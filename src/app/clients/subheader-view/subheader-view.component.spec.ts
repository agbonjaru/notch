import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubheaderViewComponent } from './subheader-view.component';

describe('SubheaderViewComponent', () => {
  let component: SubheaderViewComponent;
  let fixture: ComponentFixture<SubheaderViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubheaderViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubheaderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
