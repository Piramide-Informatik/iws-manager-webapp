import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeIws } from '../../../../../../Entities/employeeIws';
import { Subscription } from 'rxjs';
import { EmployeeIwsStateService } from '../../utils/employee-iws-state.service';
import { TeamIwsService } from '../../../../../../Services/team-iws.service';
import { EmployeeIwsUtils } from '../../utils/employee-iws-utils';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { momentCreateDate, momentFormatDate } from '../../../../../shared/utils/moment-date-utils';
@Component({
  selector: 'app-edit-iws-staff',
  standalone: false,
  templateUrl: './edit-iws-staff.component.html',
  styleUrl: './edit-iws-staff.component.scss',
})
export class EditIwsStaffComponent implements OnInit {
  public showOCCErrorModaEmployeeIws = false;
  currentEmployeeIws: EmployeeIws | null = null;
  editIwsStaffForm!: FormGroup;
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  isSaving = false;
  private readonly subscriptions = new Subscription();

  teams: any[] = [];

  constructor(
    private readonly employeeIwsUtils: EmployeeIwsUtils,
    private readonly employeeIwsStateService: EmployeeIwsStateService,
    private readonly teamIwsService: TeamIwsService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTeams();
    this.setupEmployeeIwsSubscription();
    const savedPublicHolidayId = localStorage.getItem('selectedEmployeeIwsId');
    if (savedPublicHolidayId) {
      this.loadEmployeeIwsAfterRefresh(savedPublicHolidayId);
      localStorage.removeItem('selectedEmployeeIwsId');
    }
  }

  private initForm(): void {
    this.editIwsStaffForm = new FormGroup({
      staffId: new FormControl({ value: null, disabled: true}),
      shortName: new FormControl('', []),
      firstName: new FormControl('', []),
      lastName: new FormControl('', []),
      email: new FormControl('', [Validators.email]),
      team: new FormControl('', []),
      staffSince: new FormControl(null),
      staffUntil: new FormControl(null),
    });
  }

  private loadTeams(): void {
    this.subscriptions.add(
      this.teamIwsService.getAllTeamsIws().subscribe({
        next: (teams) => (this.teams = teams),
        error: (err) => console.error('Error loading teams', err),
      })
    );
  }
  
  private setupEmployeeIwsSubscription(): void {
    this.subscriptions.add(
      this.employeeIwsStateService.currentEmployeeIws$.subscribe(
        (EmployeeIws) => {
          this.currentEmployeeIws = EmployeeIws;
          EmployeeIws
            ? this.loadEmployeeIwsData(EmployeeIws)
            : this.clearForm();
        }
      )
    );
  }

  private loadEmployeeIwsData(employeeIws: EmployeeIws): void {
    this.editIwsStaffForm.patchValue({
      staffId: employeeIws.employeeNo,
      shortName: employeeIws.employeeLabel,
      firstName: employeeIws.firstname,
      lastName: employeeIws.lastname,
      email: employeeIws.mail,
      team: employeeIws.teamIws,
      staffSince: momentCreateDate(employeeIws.startDate),
      staffUntil: momentCreateDate(employeeIws.endDate),
    });
    this.focusInputIfNeeded();
  }

  private loadEmployeeIwsAfterRefresh(employeeIwsId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.employeeIwsUtils
        .getEmployeeIwsById(Number(employeeIwsId))
        .subscribe({
          next: (employeeIws) => {
            if (employeeIws) {
              this.employeeIwsStateService.setEmployeeIwsToEdit(employeeIws);
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
      this.editIwsStaffForm.invalid ||
      !this.currentEmployeeIws ||
      this.isSaving
    ) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updateEmployeeIws: EmployeeIws = {
      ...this.currentEmployeeIws,
      employeeNo: this.editIwsStaffForm.getRawValue().staffId,
      employeeLabel: this.editIwsStaffForm.value.shortName,
      firstname: this.editIwsStaffForm.value.firstName,
      lastname: this.editIwsStaffForm.value.lastName,
      mail: this.editIwsStaffForm.value.email,
      startDate: momentFormatDate(this.editIwsStaffForm.value.staffSince),
      endDate: momentFormatDate(this.editIwsStaffForm.value.staffUntil),
      teamIws: this.editIwsStaffForm.value.team,
    };

    this.subscriptions.add(
      this.employeeIwsUtils.updateEmployeeIws(updateEmployeeIws).subscribe({
        next: (savedEmployeeIws) => this.handleSaveSuccess(savedEmployeeIws),
        error: (err) => this.handleError(err),
      })
    );
  }

  private markAllAsTouched(): void {
    Object.values(this.editIwsStaffForm.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleSaveSuccess(savedEmployeeIws: EmployeeIws): void {
    this.isSaving = false;
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS'),
    });
    this.employeeIwsStateService.setEmployeeIwsToEdit(null);
    this.clearForm();
  }

  private handleError(err: any): void {
    if (err.message === 'Version conflict: EmployeeIws has been updated by another user') {
      this.showOCCErrorModaEmployeeIws = true;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    console.error('Error saving employeeIWS:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('MESSAGE.ERROR'),
      detail: this.translate.instant('MESSAGE.UPDATE_FAILED'),
    });
    this.isSaving = false;
  }

  cancelEdit(): void {
    this.editIwsStaffForm.reset();
  }
  clearForm(): void {
    this.editIwsStaffForm.reset();
    this.currentEmployeeIws = null;
    this.isSaving = false;
  }
  onRefresh(): void {
    if (this.currentEmployeeIws?.id) {
      localStorage.setItem('selectedEmployeeIwsId', this.currentEmployeeIws.id.toString());
      window.location.reload();
    }
  }

  private focusInputIfNeeded(): void {
    if (this.currentEmployeeIws && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
