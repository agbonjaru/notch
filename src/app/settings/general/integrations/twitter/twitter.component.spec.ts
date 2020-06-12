import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitterIntegrationComponent } from './twitter.component';

describe('TwitterIntegrationComponent', () => {
  let component: TwitterIntegrationComponent;
  let fixture: ComponentFixture<TwitterIntegrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitterIntegrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitterIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
