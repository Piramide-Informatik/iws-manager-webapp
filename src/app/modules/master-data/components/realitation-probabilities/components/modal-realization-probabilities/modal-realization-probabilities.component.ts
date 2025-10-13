import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ChanceUtils } from '../../utils/chance-utils';
import { Chance } from '../../../../../../Entities/chance';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-modal-realization-probabilities',
  standalone: false,
  templateUrl: './modal-realization-probabilities.component.html',
  styleUrl: './modal-realization-probabilities.component.scss'
})
export class ModalRealizationProbabilitiesComponent implements OnChanges {
  private readonly chanceUtils = inject(ChanceUtils);
  @Input() selectedChance!: Chance;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visible: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createChance = new EventEmitter<{created?: Chance, status: 'success' | 'error'}>();
  @Output() deleteChance = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: InputNumber;
  public isLoading: boolean = false;
  private existingChances: Chance[] = [];


  public readonly chanceForm = new FormGroup({
    probability: new FormControl(null, [Validators.max(100), this.duplicateProbabilityValidator.bind(this)])
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.isCreateMode) {
      this.loadExistingChances();
      setTimeout(()=> {
        this.focusInputIfNeeded();
      })
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
    if(this.chanceForm.invalid || this.isLoading) return

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
      error: () => {
        this.isLoading = false;
        this.createChance.emit({status: 'error'})
      }
    })
  }

  public onDelete(): void {
    this.isLoading = true;
    if (this.selectedChance) {
      this.chanceUtils.deleteChance(this.selectedChance.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteChance.emit({status: 'success'});
        },
        error: (error: Error) => {
          this.isLoading = false;
          this.deleteChance.emit({status: 'error', error});
        }
      })
    }
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.chanceForm.reset();
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
