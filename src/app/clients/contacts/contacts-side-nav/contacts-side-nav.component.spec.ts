import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsSideNavComponent } from './contacts-side-nav.component';

describe('ContactsSideNavComponent', () => {
  let component: ContactsSideNavComponent;
  let fixture: ComponentFixture<ContactsSideNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsSideNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
