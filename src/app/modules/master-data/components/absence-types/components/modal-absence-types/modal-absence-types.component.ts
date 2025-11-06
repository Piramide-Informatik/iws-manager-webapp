import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbsenceType } from '../../../../../../Entities/absenceType';
import { AbsenceTypeUtils } from '../../utils/absence-type-utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-modal-absence-types',
  standalone: false,
  templateUrl: './modal-absence-types.component.html',
  styleUrl: './modal-absence-types.component.scss'
})
export class ModalAbsenceTypesComponent implements OnInit, OnChanges {
  private readonly absenceTypeUtils = inject(AbsenceTypeUtils);

  @Input() selectedAbsenceType!: AbsenceType;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visible: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createAbsenceType = new EventEmitter<{ created?: AbsenceType, status: 'success' | 'error' }>();
  @Output() deleteAbsenceTypeEvent = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  public occErrorAbscenseType: OccErrorType = 'UPDATE_UNEXISTED';
  showOCCErrorModalAbscenseType = false;
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;
  public nameAlreadyExists = false;
  public labelAlreadyExists = false;

  public readonly absenceTypeForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    label: new FormControl('', [Validators.required]),
    shareOfDay: new FormControl(null, [Validators.min(0), Validators.max(1.0)]),
    isHoliday: new FormControl(false),
    hours: new FormControl(false),
  });

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  ngOnInit(): void {
    this.absenceTypeForm.get('name')?.valueChanges.subscribe(() => {
      if (this.nameAlreadyExists) {
        this.nameAlreadyExists = false;
      }
    });

    this.absenceTypeForm.get('label')?.valueChanges.subscribe(() => {
      if (this.labelAlreadyExists) {
        this.labelAlreadyExists = false;
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  public onSubmit(): void {
    this.nameAlreadyExists = false;
    this.labelAlreadyExists = false;
    if (this.absenceTypeForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newAbsenceType: Omit<AbsenceType, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.absenceTypeForm.value.name?.trim(),
      label: this.absenceTypeForm.value.label?.trim(),
      shareOfDay: this.absenceTypeForm.value.shareOfDay ?? 0,
      isHoliday: this.absenceTypeForm.value.isHoliday ? 1 : 0,
      hours: this.absenceTypeForm.value.hours ? 1 : 0,
    };

    this.absenceTypeUtils.addAbsenceType(newAbsenceType).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createAbsenceType.emit({ created, status: 'success' })
      },
      error: (error) => {
        this.isLoading = false;
        this.createAbsenceType.emit({ status: 'error' });
        this.handleCreateDuplicityError(error);
      }
    })
  }

  private handleCreateDuplicityError(error: any): void {
    if (error.error.message.includes(this.absenceTypeForm.value.name?.trim())) {
      this.nameAlreadyExists = true;
    }

    if(error.error.message.includes(this.absenceTypeForm.value.label?.trim())){
      this.labelAlreadyExists = true;
    }
  }

  public onDelete(): void {
    this.isLoading = true;
    if (this.selectedAbsenceType) {
      this.absenceTypeUtils.deleteAbsenceType(this.selectedAbsenceType.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteAbsenceTypeEvent.emit({ status: 'success' });
        },
        error: (error) => {
          this.isLoading = false;
          this.deleteAbsenceTypeEvent.emit({ status: 'error', error });
          if (error instanceof OccError || error?.message.includes('404')) {
            this.showOCCErrorModalAbscenseType = true;
            this.occErrorAbscenseType = 'DELETE_UNEXISTED';
            return;
          }
          const errorAbscenceTypeMessage = error.error.message ?? '';
          if (errorAbscenceTypeMessage.includes('foreign key constraint fails')) {
            this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(errorAbscenceTypeMessage);
            this.isVisibleModal.emit(false);
          }
        }
      })
    }
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.absenceTypeForm.reset();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 300);
    }
  }
}