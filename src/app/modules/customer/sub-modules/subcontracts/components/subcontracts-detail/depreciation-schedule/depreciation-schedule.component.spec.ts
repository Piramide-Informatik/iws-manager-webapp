import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepreciationScheduleComponent } from './depreciation-schedule.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

describe('DepreciationScheduleComponent', () => {
  let component: DepreciationScheduleComponent;
  let fixture: ComponentFixture<DepreciationScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepreciationScheduleComponent],
      imports: [
        ReactiveFormsModule,
        TableModule,
        DialogModule,
        InputTextModule,
        ButtonModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepreciationScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
