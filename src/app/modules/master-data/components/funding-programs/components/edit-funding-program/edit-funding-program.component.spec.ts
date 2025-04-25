import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFundingProgramComponent } from './edit-funding-program.component';

describe('EditFundingProgramComponent', () => {
  let component: EditFundingProgramComponent;
  let fixture: ComponentFixture<EditFundingProgramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditFundingProgramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditFundingProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
