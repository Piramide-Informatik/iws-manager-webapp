import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StateUtils } from '../../utils/state-utils';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { emptyValidator } from '../../../types-of-companies/utils/empty.validator';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-state-modal',
  standalone: false,
  templateUrl: './state-modal.component.html',
  styleUrl: './state-modal.component.scss'
})
export class StateModalComponent {
  private readonly stateUtils = inject(StateUtils);
  @ViewChild('stateInput') stateInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() stateToDelete: number | null = null;
  @Input() stateName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() stateCreated = new EventEmitter<void>();
  @Output() confirmStateDelete = new EventEmitter<number>();
  isStateLoading = false;
  errorStateMessage: string | null = null;

  readonly stateForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      emptyValidator()
    ])
  });

  constructor(private readonly messageService: MessageService,
              private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.stateForm.reset();
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
          this.confirmStateDelete.emit(); 
          this.closeStateModal();
        },
        error: (error) => {
          this.isStateLoading = false;
          this.errorStateMessage = error.message ?? 'Failed to delete state';
          console.error('Delete error:', error);
        }
      });
    }
  }

  onCreateStateFormSubmit(): void {
    if (this.shouldStatePreventSubmission()) return;

    this.prepareForStateSubmission();
    const stateName = this.stateForm.value.name ?? '';

    this.stateUtils.stateExists(stateName).pipe(
      switchMap(exists => this.handleStateExistence(exists, stateName)),
      catchError(err => this.handleStateError('STATES.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.isStateLoading = false)
    ).subscribe({
      next: (data) => {
        if (data !== null) {
          this.onCreateStateSuccessfully()
        }
      }
    });

    this.handleStateClose();
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
      return of(null);
    }

    return this.stateUtils.createNewState(stateName).pipe(
      catchError(err => this.handleStateError('STATES.ERROR.CREATION_FAILED', err))
    )
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
    this.isStateLoading = false;
    this.isVisibleModal.emit(false);
    this.stateForm.reset();
  }

  closeStateModal(): void {
    this.isVisibleModal.emit(false);
    this.stateForm.reset();
  }

  onCancel(): void {
    this.handleStateClose();
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
