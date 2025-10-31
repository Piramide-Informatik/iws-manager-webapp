import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BillerUtils } from '../../utils/biller-utils';
import { Biller } from '../../../../../../Entities/biller';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-biller',
  standalone: false,
  templateUrl: './modal-biller.component.html',
  styleUrl: './modal-biller.component.scss'
})
export class ModalBillerComponent implements OnChanges, OnInit {
  private readonly billerUtils = inject(BillerUtils);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedBiller!: Biller;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createBiller = new EventEmitter<{ created?: Biller, status: 'success' | 'error' }>();
  @Output() deleteBiller = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public isLoading: boolean = false;
  public showOCCErrorModaBiller = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public nameAlreadyExist = false;

  public readonly billerForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    // Reset nameAlreadyExist when user types
    this.billerForm.get('name')?.valueChanges.subscribe(() => {
      if (this.nameAlreadyExist) {
        this.nameAlreadyExist = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.modalType === 'create') {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  onSubmit(): void {
    if (this.billerForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newBiller: Omit<Biller, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.billerForm.value.name?.trim()
    }

    this.billerUtils.addBiller(newBiller).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createBiller.emit({ created, status: 'success' });
      },
      error: (error) => {
        this.isLoading = false;
        this.handleCreateError(error);
      }
    })
  }

  private handleCreateError(error: any): void {
    if (error?.message?.includes('biller name already exists')) {
      this.nameAlreadyExist = true;
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('BILLERS.ERROR.NAME_ALREADY_EXIST'),
      });
      this.createBiller.emit({ status: 'error' });
    } else if (error?.message?.includes('Biller name is required')) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('ERROR.FIELD_REQUIRED'),
      });
      this.createBiller.emit({ status: 'error' });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('MESSAGE.CREATE_FAILED'),
      });
      this.createBiller.emit({ status: 'error' });
    }
  }

  removeBiller(): void {
    this.isLoading = true;
    this.billerUtils.deleteBiller(this.selectedBiller.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.deleteBiller.emit({ status: 'success' });
      },
      error: (errorDeleteBiller) => {
        this.isLoading = false;
        this.handleOCCDeleteError(errorDeleteBiller)
        this.deleteBiller.emit({ status: 'error', error: errorDeleteBiller });
        this.closeModal();
      }
    })
  }

  private handleOCCDeleteError(error: any): void {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModaBiller = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.billerForm.reset();
    this.nameAlreadyExist = false;
  }

  public focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}