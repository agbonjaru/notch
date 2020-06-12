import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrichLeadComponent } from './enrich-lead.component';

describe('EnrichLeadComponent', () => {
  let component: EnrichLeadComponent;
  let fixture: ComponentFixture<EnrichLeadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrichLeadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrichLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
