import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaniesSideNavComponent } from './companies-side-nav.component';

describe('CompaniesSideNavComponent', () => {
  let component: CompaniesSideNavComponent;
  let fixture: ComponentFixture<CompaniesSideNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompaniesSideNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompaniesSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
