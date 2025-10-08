import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EmployeeCategory } from '../../../../../../Entities/employee-category ';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EmployeeCategoryStateService } from '../../utils/employee-category-state.service';
import { EmployeeCategoryUtils } from '../../utils/employee-category-utils';
import { TranslateService } from '@ngx-translate/core';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

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
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  private readonly editEmployeeCategorySource =
    new BehaviorSubject<EmployeeCategory | null>(null);

  constructor(
    private readonly employeeCategoryUtils: EmployeeCategoryUtils,
    private readonly employeeCategoryStateService: EmployeeCategoryStateService,
    private readonly commonMessageService: CommonMessagesService,
    private readonly translate: TranslateService
  ) { }

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
    this.focusInputIfNeeded();
  }

  private loadEmployeeCategoryAfterRefresh(employeeCategoryId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.employeeCategoryUtils
        .getEmployeeCategoryById(Number(employeeCategoryId))
        .subscribe({
          next: (employeeCategory) => {
            if (employeeCategory) {
              this.employeeCategoryStateService.setEmployeeCategoryToEdit(
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
      title: this.editQualificationForm.value.qualification?.trim(),
      label: this.editQualificationForm.value.abbreviation?.trim(),
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
    this.commonMessageService.showEditSucessfullMessage();
    this.employeeCategoryStateService.setEmployeeCategoryToEdit(null);
    this.clearForm();
  }

  private handleError(err: any): void {
    if (err instanceof OccError) {
      console.log("tipo de error: ", err.errorType)
      this.showOCCErrorModalEmployeeCategory = true;
      this.occErrorType = err.errorType;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    console.error('Error saving EmployeeCategory:', error);
    this.commonMessageService.showErrorEditMessage();
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
        'selectedEmployeeCategoryId',
        this.currentEmployeeCategory.id.toString()
      );
      window.location.reload();
    }
  }

  private focusInputIfNeeded(): void {
    if (this.currentEmployeeCategory && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
