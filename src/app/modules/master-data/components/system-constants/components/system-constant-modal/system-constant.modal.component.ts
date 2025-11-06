import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SystemConstantUtils } from '../../utils/system-constant.utils';
import { System } from '../../../../../../Entities/system';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-system-constant-modal',
  standalone: false,
  templateUrl: './system-constant.modal.component.html',
  styleUrl: './system-constant.modal.component.scss'
})
export class SystemConstantModalComponent implements OnInit, OnChanges {
  private readonly systemConstantUtils = inject(SystemConstantUtils);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedSystemConstant!: System | null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createSystemConstant = new EventEmitter<{created?: System, status: 'success' | 'error'}>();
  @Output() deleteSystemConstant = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public createSystemConstantForm!: FormGroup;
  public isLoading = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalSystem = false;
  public nameAlreadyExists = false;
  constructor(){}

  ngOnInit(): void {
    this.createSystemConstantForm  = new FormGroup({
      name: new FormControl('', [Validators.required]),
      valueNum: new FormControl(null),
      valueChar: new FormControl(''),
    });

    this.cleanFormErrorMessages();
  }

  private cleanFormErrorMessages(): void {
    this.createSystemConstantForm.get('name')?.valueChanges.subscribe(() => {
      if (this.nameAlreadyExists) {
        this.nameAlreadyExists = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  onSubmit(): void {
    if(this.createSystemConstantForm.invalid || this.isLoading) return

    this.isLoading = true;
    const createSystemConstantFormValue = this.createSystemConstantForm.value;
    createSystemConstantFormValue.name = createSystemConstantFormValue.name?.trim();
    createSystemConstantFormValue.valueChar = createSystemConstantFormValue.valueChar?.trim();
    const systemConstant: Omit<System, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      ...createSystemConstantFormValue
    }

    this.systemConstantUtils.createNewSystemConstant(systemConstant).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createSystemConstant.emit({created, status: 'success'});
      },
      error: (error) => {
        this.isLoading = false;
        this.handleCreateDuplicityError(error);
        this.createSystemConstant.emit({ status: 'error' });
      } 
    })
  }

  private handleCreateDuplicityError(error: any): void {
    if (error.error.message.includes("duplication with")) {
      this.nameAlreadyExists = true;
    }
  }

  onDeleteSystemConstantConfirm() {
    this.isLoading = true;
    if (this.selectedSystemConstant) {
      this.systemConstantUtils.deleteSystemConstant(this.selectedSystemConstant.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteSystemConstant.emit({status: 'success'});
        },
        error: (errorResponse) => {
          this.isLoading = false;
          this.handleDeleteError(errorResponse);
          this.deleteSystemConstant.emit({ status: 'error', error: errorResponse });
        }
      })
    }
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalSystem = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  closeModal() {
    this.createSystemConstantForm.reset();
    this.isVisibleModal.emit(false);
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
      }, 200);
    }
  }
}
