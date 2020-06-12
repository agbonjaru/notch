import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactLeadComponent } from './contact-lead.component';

describe('ContactLeadComponent', () => {
  let component: ContactLeadComponent;
  let fixture: ComponentFixture<ContactLeadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactLeadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
