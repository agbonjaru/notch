import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesCompetitionTerritoryComponent } from './sales-competition-territory.component';


describe('SalesCompetitionTerritoryComponent', () => {
  let component: SalesCompetitionTerritoryComponent;
  let fixture: ComponentFixture<SalesCompetitionTerritoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesCompetitionTerritoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesCompetitionTerritoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
