import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ChanceUtils } from '../../utils/chance-utils';
import { Chance } from '../../../../../../Entities/chance';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { ChanceStateService } from '../../utils/chance-state.service';
import { take } from 'rxjs/operators';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-modal-realization-probabilities',
  standalone: false,
  templateUrl: './modal-realization-probabilities.component.html',
  styleUrl: './modal-realization-probabilities.component.scss'
})
export class ModalRealizationProbabilitiesComponent implements OnInit, OnChanges {
  private readonly chanceUtils = inject(ChanceUtils);
  private readonly chanceStateService = inject(ChanceStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  
  @Input() selectedChance!: Chance;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visible: boolean = false;
  @Input() language: string = '';
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createChance = new EventEmitter<{created?: Chance, status: 'success' | 'error'}>();
  @Output() deleteChance = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: InputNumber;
  public isLoading: boolean = false;
  private existingChances: Chance[] = [];
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalChance = false;
  public probabilityAlreadyExist = false;
  dynamicSize = {
    'width': '300px'
  }
  private readonly sizes: any = {
    de: '280px',
    en: '220px',
    es: '210px'
  }
  public readonly chanceForm = new FormGroup({
    probability: new FormControl(null, [Validators.max(100), this.duplicateProbabilityValidator.bind(this)])
  });

  ngOnInit(): void {
    this.dynamicSize['width'] = this.sizes[this.language];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.isCreateMode) {
      this.loadExistingChances();
      setTimeout(()=> {
        this.focusInputIfNeeded();
      })
    }
    let sizeChange = changes['language'];
    if (sizeChange && !sizeChange.firstChange) {
      this.dynamicSize['width'] = this.sizes[sizeChange.currentValue];
    }
  } 

  private loadExistingChances(): void {
    this.chanceUtils.getAllChances().subscribe({
      next: (chances) => {
        this.existingChances = chances;
        this.chanceForm.get('probability')?.updateValueAndValidity();
      },
      error: (err) => {
        console.error('Error loading chances:', err);
      }
    });
  }

  private duplicateProbabilityValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.isCreateMode) {
      return null;
    }

    const probability = Number(control.value);
    const isDuplicate = this.existingChances.some(
      chance => Number(chance.probability) === probability
    );

    return isDuplicate ? { duplicate: true } : null;
  }

  public onSubmit(): void {
    if(this.chanceForm.invalid || this.isLoading || this.probabilityAlreadyExist) return

    this.isLoading = true;
    const newChance: Omit<Chance, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      probability: this.chanceForm.value.probability ?? 0
    };

    this.chanceUtils.addChance(newChance).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createChance.emit({created, status: 'success'})
      },
      error: (error) => {
        this.isLoading = false;
        if (error.message?.includes('probability already exists')) {
          this.probabilityAlreadyExist = true;
          this.chanceForm.get('probability')?.valueChanges.pipe(take(1))
            .subscribe(() => this.probabilityAlreadyExist = false);
          this.commonMessageService.showErrorCreatedMessage();
        } else {
          this.createChance.emit({status: 'error'})
          this.commonMessageService.showErrorCreatedMessage();
        }
      }
    })
  }

  public onDelete(): void {
    this.isLoading = true;
    if (this.selectedChance) {
      this.chanceUtils.deleteChance(this.selectedChance.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.chanceStateService.clearChance();
          this.deleteChance.emit({status: 'success'});
          this.closeModal();
        },
        error: (errorResponse) => {
          this.isLoading = false;
          this.handleDeleteError(errorResponse);
          this.deleteChance.emit({status: 'error', error:errorResponse});
          this.commonMessageService.showErrorDeleteMessage(); 
        }
      })
    }
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalChance = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.chanceForm.reset();
    this.probabilityAlreadyExist = false;
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  get isDuplicateProbability(): boolean {
    const control = this.chanceForm.get('probability');
    return !!(control?.hasError('duplicate') && (control?.dirty || control?.touched));
  }

  get isMaxError(): boolean {
    const control = this.chanceForm.get('probability');
    return !!(control?.hasError('max') && (control?.dirty || control?.touched));
  }

  private focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput.input.nativeElement) {
          this.firstInput.input.nativeElement.focus();
        }
      }, 300);
    }
  }
}