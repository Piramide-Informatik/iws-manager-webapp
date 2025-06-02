import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeOfCompaniesModalComponent } from './type-of-companies-modal.component';

describe('TypeOfCompaniesModalComponent', () => {
  let component: TypeOfCompaniesModalComponent;
  let fixture: ComponentFixture<TypeOfCompaniesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypeOfCompaniesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeOfCompaniesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
