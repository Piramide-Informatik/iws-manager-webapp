import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesOfCompaniesFormComponent } from './types-of-companies-form.component';

describe('TypesOfCompaniesFormComponent', () => {
  let component: TypesOfCompaniesFormComponent;
  let fixture: ComponentFixture<TypesOfCompaniesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypesOfCompaniesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypesOfCompaniesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
