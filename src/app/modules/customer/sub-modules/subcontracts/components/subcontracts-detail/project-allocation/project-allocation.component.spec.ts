import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectAllocationComponent } from './project-allocation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

describe('ProjectAllocationComponent', () => {
  let component: ProjectAllocationComponent;
  let fixture: ComponentFixture<ProjectAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectAllocationComponent],
      imports: [
        ReactiveFormsModule,
        TableModule,
        DialogModule,
        InputTextModule,
        ButtonModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
