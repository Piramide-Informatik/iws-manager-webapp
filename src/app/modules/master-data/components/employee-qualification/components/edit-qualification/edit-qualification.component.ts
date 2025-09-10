import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EmployeeCategory } from '../../../../../../Entities/employee-category ';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EmployeeCategoryStateService } from '../../utils/employee-category-state.service';
import { EmployeeCategoryUtils } from '../../utils/employee-category-utils';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-qualification',
  standalone: false,
  templateUrl: './edit-qualification.component.html',
  styleUrl: './edit-qualification.component.scss',
})
export class EditQualificationComponent implements OnInit {
  public showOCCErrorModalEmployeeCategory = false;
  currentEmployeeCategory: EmployeeCategory | null = null;
  editQualificationForm!: FormGroup;

  isSaving = false;
  private readonly subscriptions = new Subscription();
  private readonly editEmployeeCategorySource =
    new BehaviorSubject<EmployeeCategory | null>(null);

  constructor(
    private readonly employeeCategoryUtils: EmployeeCategoryUtils,
    private readonly employeeCategoryStateService: EmployeeCategoryStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupEmployeeCategorySubscription();
    const savedEmployeeCategoryId = localStorage.getItem(
      'selectedEmployeeCategoryIwsId'
    );
    if (savedEmployeeCategoryId) {
      this.loadEmployeeCategoryAfterRefresh(savedEmployeeCategoryId);
      localStorage.removeItem('selectedEmployeeCategoryId');
    }
  }

  private initForm(): void {
    this.editQualificationForm = new FormGroup({
      qualification: new FormControl('', [Validators.required]),
      abbreviation: new FormControl('', [Validators.required]),
    });
  }

  private setupEmployeeCategorySubscription(): void {
    this.subscriptions.add(
      this.employeeCategoryStateService.currentEmployeeCategory$.subscribe(
        (EmployeeCategory) => {
          this.currentEmployeeCategory = EmployeeCategory;
          EmployeeCategory
            ? this.loadEEmployeeCategoryData(EmployeeCategory)
            : this.clearForm();
        }
      )
    );
  }

  private loadEEmployeeCategoryData(employeeCategory: EmployeeCategory): void {
    this.editQualificationForm.patchValue({
      qualification: employeeCategory.title,
      abbreviation: employeeCategory.label,
    });
  }

  private loadEmployeeCategoryAfterRefresh(employeeCategoryId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.employeeCategoryUtils
        .getEmployeeCategoryById(Number(employeeCategoryId))
        .subscribe({
          next: (employeeCategory) => {
            if (employeeCategory) {
              this.employeeCategoryStateService.setPEmployeeCategoryToEdit(
                employeeCategory
              );
            }
            this.isSaving = false;
          },
          error: () => {
            this.isSaving = false;
          },
        })
    );
  }

  onSubmit(): void {
    if (
      this.editQualificationForm.invalid ||
      !this.currentEmployeeCategory ||
      this.isSaving
    ) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updateEmployeeCategory: EmployeeCategory = {
      ...this.currentEmployeeCategory,
      title: this.editQualificationForm.value.qualification,
      label: this.editQualificationForm.value.abbreviation,
    };

    this.subscriptions.add(
      this.employeeCategoryUtils
        .updateEmployeeCategory(updateEmployeeCategory)
        .subscribe({
          next: (savedEmployeeCategory) =>
            this.handleSaveSuccess(savedEmployeeCategory),
          error: (err) => this.handleError(err),
        })
    );
  }

  private markAllAsTouched(): void {
    Object.values(this.editQualificationForm.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleSaveSuccess(savedEEmployeeCategory: EmployeeCategory): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS'),
    });
    this.employeeCategoryStateService.setPEmployeeCategoryToEdit(null);
    this.clearForm();
  }

  private handleError(err: any): void {
    if (
      err.message ===
      'Version conflict: EmployeeCategory has been updated by another user'
    ) {
      this.showOCCErrorModalEmployeeCategory = true;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    console.error('Error saving EmployeeCategory:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('MESSAGE.ERROR'),
      detail: this.translate.instant('MESSAGE.UPDATE_FAILED'),
    });
    this.isSaving = false;
  }

  cancelEdit(): void {
    this.editQualificationForm.reset();
  }
  clearForm(): void {
    this.editQualificationForm.reset();
    this.currentEmployeeCategory = null;
    this.isSaving = false;
  }
  onRefresh(): void {
    if (this.currentEmployeeCategory?.id) {
      localStorage.setItem(
        'selectedPublicHolidayId',
        this.currentEmployeeCategory.id.toString()
      );
      window.location.reload();
    }
  }
}
