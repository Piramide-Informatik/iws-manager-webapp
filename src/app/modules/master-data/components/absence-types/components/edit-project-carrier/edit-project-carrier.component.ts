import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AbsenceTypeUtils } from '../../utils/absence-type-utils';
import { AbsenceTypeStateService } from '../../utils/absence-type-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';
import { AbsenceType } from '../../../../../../Entities/absenceType';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-edit-project-carrier',
  standalone: false,
  templateUrl: './edit-project-carrier.component.html',
  styleUrl: './edit-project-carrier.component.scss'
})
export class EditProjectCarrierComponent implements OnInit, OnDestroy{
  private readonly absenceTypeUtils = inject(AbsenceTypeUtils);
  private readonly absenceTypeStateService = inject(AbsenceTypeStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  public absenceTypeToEdit: AbsenceType| null = null;
  public showOCCErrorModaAbsence = false;
  public isLoading: boolean = false;
  public editProjectCarrierForm!: FormGroup;
  public occErrorAbscenceType: OccErrorType = 'UPDATE_UPDATED';
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.editProjectCarrierForm = new FormGroup({
      name: new FormControl(''),
      label: new FormControl(''),
      shareOfDay: new FormControl(null, [Validators.min(0), Validators.max(1.0)]),
      isHoliday: new FormControl(false),
      hours: new FormControl(false), // can be Booked
    });
    this.setupAbsenceTypeSubscription();
    // Check if we need to load an absence type after page refresh for OCC
    const savedAbsenceTypeId = localStorage.getItem('selectedAbsenceTypeId');
    if (savedAbsenceTypeId) {
      this.loadAbsenceTypeAfterRefresh(savedAbsenceTypeId);
      localStorage.removeItem('selectedAbsenceTypeId');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.editProjectCarrierForm.invalid || !this.absenceTypeToEdit) return

    this.isLoading = true;
    const updatedAbsenceType: AbsenceType = {
      id: this.absenceTypeToEdit.id,
      version: this.absenceTypeToEdit.version,
      createdAt: '',
      updatedAt: '',
      name: this.editProjectCarrierForm.value.name?.trim(),
      label: this.editProjectCarrierForm.value.label?.trim(),
      shareOfDay: this.editProjectCarrierForm.value.shareOfDay,
      isHoliday: this.editProjectCarrierForm.value.isHoliday ? 1 : 0,
      hours: this.editProjectCarrierForm.value.hours ? 1 : 0
    }

    this.absenceTypeUtils.updateAbsenceType(updatedAbsenceType).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error: Error) => this.handleAbsenceTypeEditError(error),
    });
  }

  private handleAbsenceTypeEditError(err: any): void {
      console.log(err);
      if (err instanceof OccError) { 
        this.showOCCErrorModaAbsence = true;
        this.occErrorAbscenceType = err.errorType;
      }
      this.commonMessageService.showErrorEditMessage();
      this.isLoading = false;
    }

  private setupAbsenceTypeSubscription(): void {
    this.subscriptions.add(
      this.absenceTypeStateService.currentAbsenceType$.subscribe(absenceType => {
        if(absenceType){
          this.absenceTypeToEdit = absenceType;
          this.editProjectCarrierForm.patchValue({
            name: this.absenceTypeToEdit.name,
            label: this.absenceTypeToEdit.label,
            shareOfDay: this.absenceTypeToEdit.shareOfDay,
            isHoliday: this.absenceTypeToEdit.isHoliday === 1,
            hours: this.absenceTypeToEdit.hours === 1
          });
          this.focusInputIfNeeded();
        } else {
          this.editProjectCarrierForm.reset();
        }
      })
    )
  }

  public onRefresh(): void {
    if (this.absenceTypeToEdit?.id) {
      localStorage.setItem('selectedAbsenceTypeId', this.absenceTypeToEdit.id.toString());
      window.location.reload();
    }
  }

  public clearForm(): void {
    this.editProjectCarrierForm.reset();
    this.absenceTypeStateService.clearAbsenceType();
    this.absenceTypeToEdit = null;
  }

  private loadAbsenceTypeAfterRefresh(absenceTypeId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.absenceTypeUtils.getAbsenceTypeById(Number(absenceTypeId)).subscribe({
        next: (absenceType) => {
          if (absenceType) {
            this.absenceTypeStateService.setAbsenceTypeToEdit(absenceType);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      })
    );
  }

  private focusInputIfNeeded(): void {
    if (this.absenceTypeToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
