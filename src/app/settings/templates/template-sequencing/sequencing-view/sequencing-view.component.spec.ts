import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SequencingViewComponent } from './sequencing-view.component';

describe('SequencingViewComponent', () => {
  let component: SequencingViewComponent;
  let fixture: ComponentFixture<SequencingViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SequencingViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SequencingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
