import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDealsComponent } from './create-deals.component';

describe('CreateDealsComponent', () => {
  let component: CreateDealsComponent;
  let fixture: ComponentFixture<CreateDealsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDealsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
