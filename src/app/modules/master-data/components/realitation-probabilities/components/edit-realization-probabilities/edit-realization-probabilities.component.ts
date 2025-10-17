import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Chance } from '../../../../../../Entities/chance';
import { ChanceUtils } from '../../utils/chance-utils';
import { ChanceStateService } from '../../utils/chance-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';
import { InputNumber } from 'primeng/inputnumber';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';


@Component({
  selector: 'master-data-edit-realization-probabilities',
  standalone: false,
  templateUrl: './edit-realization-probabilities.component.html',
  styleUrl: './edit-realization-probabilities.component.scss'
})
export class EditRealizationProbabilitiesComponent implements OnInit, OnDestroy {
  private readonly chanceUtils = inject(ChanceUtils);
  private readonly chanceStateService = inject(ChanceStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  public chanceToEdit: Chance | null = null;
  public showOCCErrorModalChance = false;
  public isLoading: boolean = false;
  @ViewChild('firstInput') firstInput!: InputNumber;
  public editProbablitiesForm!: FormGroup;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';


  ngOnInit(): void {
    this.editProbablitiesForm = new FormGroup({
      probability: new FormControl(null, [Validators.max(100.00)])
    });
    this.setupChanceSubscription();
    // Check if we need to load an chance after page refresh for OCC
    const savedChanceId = localStorage.getItem('selectedChanceId');
    if (savedChanceId) {
      this.loadChanceAfterRefresh(savedChanceId);
      localStorage.removeItem('selectedChanceId');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if(this.editProbablitiesForm.invalid || !this.chanceToEdit) return

    this.isLoading = true;
    const editedChance: Chance = {
      ...this.chanceToEdit,
      probability: this.editProbablitiesForm.value.probability ?? 0
    }

    this.chanceUtils.updateChance(editedChance).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error: Error) => {
        this.isLoading = false;
        if(error instanceof OccError){
          console.log('OCC Error occurred:', error);
          this.showOCCErrorModalChance = true;
          this.occErrorType = error.errorType;
          this.commonMessageService.showErrorEditMessage();
        }else{
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  private setupChanceSubscription(): void {
    this.subscriptions.add(
      this.chanceStateService.currentChance$.subscribe(chance => {
        if(chance){
          this.chanceToEdit = chance;
          this.editProbablitiesForm.patchValue({
            probability: this.chanceToEdit.probability
          });
          this.focusInputIfNeeded();
        } else {
          this.editProbablitiesForm.reset();
        }
      })
    )
  }

  public onRefresh(): void {
    if (this.chanceToEdit?.id) {
      localStorage.setItem('selectedChanceId', this.chanceToEdit.id.toString());
      globalThis.location.reload();
    }
  }

  public clearForm(): void {
    this.editProbablitiesForm.reset();
    this.chanceStateService.clearChance();
    this.chanceToEdit = null;
  }

  private loadChanceAfterRefresh(chanceId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.chanceUtils.getChanceById(Number(chanceId)).subscribe({
        next: (chance) => {
          if (chance) {
            this.chanceStateService.setChanceToEdit(chance);
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
    setTimeout(() => {
      if (this.firstInput.input.nativeElement) {
        this.firstInput.input.nativeElement.focus();
      }
    }, 300);
  }
}
