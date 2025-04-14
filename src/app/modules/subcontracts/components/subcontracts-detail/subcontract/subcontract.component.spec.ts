import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubcontractComponent } from './subcontract.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextarea } from 'primeng/inputtextarea';

describe('SubcontractComponent', () => {
  let component: SubcontractComponent;
  let fixture: ComponentFixture<SubcontractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubcontractComponent],
      imports: [
        ReactiveFormsModule,
        InputTextModule,
        CalendarModule,
        DropdownModule,
        CheckboxModule,
        InputTextarea,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubcontractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
