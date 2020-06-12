import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsInnerDetailsComponent } from './contacts-inner-details.component';

describe('ContactsInnerDetailsComponent', () => {
  let component: ContactsInnerDetailsComponent;
  let fixture: ComponentFixture<ContactsInnerDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsInnerDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsInnerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
