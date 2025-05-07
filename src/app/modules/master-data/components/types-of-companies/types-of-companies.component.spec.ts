import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesOfCompaniesComponent } from './types-of-companies.component';

describe('TypesOfCompaniesComponent', () => {
  let component: TypesOfCompaniesComponent;
  let fixture: ComponentFixture<TypesOfCompaniesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypesOfCompaniesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypesOfCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
