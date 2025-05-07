import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesOfCompaniesTableComponent } from './types-of-companies-table.component';

describe('TypesOfCompaniesTableComponent', () => {
  let component: TypesOfCompaniesTableComponent;
  let fixture: ComponentFixture<TypesOfCompaniesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypesOfCompaniesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypesOfCompaniesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
