import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StateUtils } from '../../utils/state-utils';
import { of } from 'rxjs';
import { emptyValidator } from '../../../types-of-companies/utils/empty.validator';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { StatesStateService } from '../../utils/states.state.service.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-state-modal',
  standalone: false,
  templateUrl: './state-modal.component.html',
  styleUrl: './state-modal.component.scss'
})
export class StateModalComponent implements OnInit, OnChanges {
  private readonly stateUtils = inject(StateUtils);
  private readonly stateStateService = inject(StatesStateService);
  @ViewChild('stateInput') stateInput!: ElementRef<HTMLInputElement>;
  
  @Input() isVisibleModal: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() stateToDelete: number | null = null;
  @Input() stateName: string | null = null;
  
  @Output() isVisibleModalChange = new EventEmitter<boolean>();
  @Output() stateCreated = new EventEmitter<void>();
  @Output() confirmStateDelete = new EventEmitter<{severity: string, summary: string, detail: string}>();
  
  isStateLoading = false;
  errorStateMessage: string | null = null;
  showOCCErrorModalState = false;
  occErrorStateType: OccErrorType = 'UPDATE_UNEXISTED';
  readonly stateForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      emptyValidator()
    ])
  });

  constructor(
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly commonMessageService: CommonMessagesService
  ) {}

  ngOnInit(): void {
    this.stateForm.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisibleModal'] && !changes['isVisibleModal'].currentValue) {
      this.resetModal();
    }
    
    if (changes['isVisibleModal'] && changes['isVisibleModal'].currentValue) {
      this.focusStateInputIfNeeded();
    }
  }

  get isStateCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onStateDeleteConfirm(): void {
    this.isStateLoading = true;
    if(this.stateToDelete){
      this.stateUtils.deleteState(this.stateToDelete).subscribe({
        next: () => {
          this.isStateLoading = false;
          this.stateStateService.setStateToEdit(null);
          this.confirmStateDelete.emit({
            severity: 'success',
            summary: 'MESSAGE.SUCCESS',
            detail: 'MESSAGE.DELETE_SUCCESS'
          }); 
          this.closeStateModal();
        },
        error: (error) => {
          this.isStateLoading = false;
          if (error instanceof OccError || error?.message.includes('404')) {
            this.showOCCErrorModalState = true;
            this.occErrorStateType = 'DELETE_UNEXISTED';
          }
          this.errorStateMessage = error.message ?? 'Failed to delete state';
          console.error('Delete error:', error);
          this.confirmStateDelete.emit({
            severity: 'error',
            summary: 'MESSAGE.ERROR',
            detail: this.errorStateMessage?.includes('it is in use by other entities') ? 'MESSAGE.DELETE_ERROR_IN_USE' : 'MESSAGE.DELETE_FAILED'
          });
          this.closeStateModal();
        }
      });
    }
  }

  onCreateStateFormSubmit(): void {
    if (this.shouldStatePreventSubmission()) return;

    this.prepareForStateSubmission();
    const stateName = this.stateForm.value.name?.trim() ?? '';

    this.stateUtils.stateExists(stateName).subscribe({
      next: (exists) => this.handleStateExistence(exists, stateName),
      error: (err) => this.handleStateError('STATES.ERROR.CHECKING_DUPLICATE', err)
    });
  }

  private shouldStatePreventSubmission(): boolean {
    return this.stateForm.invalid || this.isStateLoading;
  }

  private prepareForStateSubmission(): void {
    this.isStateLoading = true;
    this.errorStateMessage = null;
  }

  private handleStateExistence(exists: boolean, stateName: string) {
    if (exists) {
      this.errorStateMessage = 'STATES.ERROR.STATE_ALREADY_EXIST';
      this.messageService.add({
        severity: 'error',
        summary: this.translateService.instant('MESSAGE.ERROR'),
        detail: this.translateService.instant(this.errorStateMessage)
      });
      this.isStateLoading = false;
      this.handleStateClose();
      return;
    } 
    this.stateUtils.createNewState(stateName).subscribe({
      next: () => this.commonMessageService.showCreatedSuccesfullMessage(),
      error: () => this.commonMessageService.showErrorCreatedMessage(),
      complete: () => {
        this.isStateLoading = false;
        this.handleStateClose();
      }
    });
  }

  private handleStateError(messageKey: string, error: any) {
    this.errorStateMessage = messageKey;
    console.error('Error:', error);
    return of(null);
  }

  private onCreateStateSuccessfully() {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('MESSAGE.SUCCESS'),
      detail: this.translateService.instant('STATES.MESSAGE.CREATE_SUCCESS')
    });
  }

  handleStateClose(): void {
    this.closeStateModal();
  }

  closeStateModal(): void {
    this.isVisibleModalChange.emit(false);
    this.resetModal();
  }

  onCancel(): void {
    this.closeStateModal();
  }

  private resetModal(): void {
    this.stateForm.reset();
    this.errorStateMessage = null;
    this.isStateLoading = false;
  }

  public focusStateInputIfNeeded() {
    if (this.isStateCreateMode && this.stateInput) {
      setTimeout(() => {
        if (this.stateInput?.nativeElement) {
          this.stateInput.nativeElement.focus(); 
        }
      }, 150); 
    }
  }
}