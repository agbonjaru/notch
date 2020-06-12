import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateSequencingComponent } from './template-sequencing.component';

describe('TemplateSequencingComponent', () => {
  let component: TemplateSequencingComponent;
  let fixture: ComponentFixture<TemplateSequencingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateSequencingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateSequencingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
