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
  public absenceTypeToEdit: AbsenceType | null = null;
  public showOCCErrorModaAbsence = false;
  public isLoading: boolean = false;
  public editProjectCarrierForm!: FormGroup;
  public occErrorAbscenceType: OccErrorType = 'UPDATE_UPDATED';
  public nameAlreadyExists = false;
  public labelAlreadyExists = false;
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.editProjectCarrierForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      label: new FormControl('', [Validators.required]),
      shareOfDay: new FormControl(null, [Validators.min(0), Validators.max(1.0)]),
      isHoliday: new FormControl(false),
      hours: new FormControl(false),
    });
    this.setupAbsenceTypeSubscription();
    this.loadAbsenceTypeAfterRefresh();
    this.cleanErrorMessages();
  }

  private cleanErrorMessages(): void{
    this.editProjectCarrierForm.get('name')?.valueChanges.subscribe(() => {
      if (this.nameAlreadyExists) {
        this.nameAlreadyExists = false;
      }
    });

    this.editProjectCarrierForm.get('label')?.valueChanges.subscribe(() => {
      if (this.labelAlreadyExists) {
        this.labelAlreadyExists = false;
      }
    });
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
      error: (error: Error) => {
        this.handleAbsenceTypeEditError(error);
        this.handleUpdateDuplicationError(error);
        this.commonMessageService.showErrorEditMessage();
      }
    });
  }

  private handleUpdateDuplicationError(error: any): void {
    console.log("error: ", error.error.message)
    if (error.error.message.includes("duplication with")) {
      if (error.error.message.includes(this.editProjectCarrierForm.value.name?.trim())) {
        this.nameAlreadyExists = true;
      }

      if (error.error.message.includes(this.editProjectCarrierForm.value.label?.trim())) {
        this.labelAlreadyExists = true;
      }
    }
  }

  private handleAbsenceTypeEditError(err: any): void {
    this.isLoading = false;
    if (err instanceof OccError) { 
      this.showOCCErrorModaAbsence = true;
      this.occErrorAbscenceType = err.errorType;
    }
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
      globalThis.location.reload();
    }
  }

  public clearForm(): void {
    this.editProjectCarrierForm.reset();
    this.absenceTypeStateService.clearAbsenceType();
    this.absenceTypeToEdit = null;
  }

  private loadAbsenceTypeAfterRefresh(): void {
    const savedAbsenceTypeId = localStorage.getItem('selectedAbsenceTypeId');
    if (savedAbsenceTypeId) {
      this.isLoading = true;
      this.subscriptions.add(
        this.absenceTypeUtils.getAbsenceTypeById(Number(savedAbsenceTypeId)).subscribe({
          next: (absenceType) => {
            if (absenceType) {
              this.absenceTypeStateService.setAbsenceTypeToEdit(absenceType);
            }
            this.isLoading = false;
            localStorage.removeItem('selectedAbsenceTypeId');
          },
          error: () => {
            this.isLoading = false;
            localStorage.removeItem('selectedAbsenceTypeId');
          }
        })
      );
    }
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