import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PromoterUtils } from '../../utils/promoter-utils';
import { Promoter } from '../../../../../../Entities/promoter';
import { toSignal } from '@angular/core/rxjs-interop';
import { CountryUtils } from '../../../countries/utils/country-util';
import { Country } from '../../../../../../Entities/country';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-modal-project-funnel',
  standalone: false,
  templateUrl: './modal-project-funnel.component.html',
  styleUrl: './modal-project-funnel.component.scss'
})
export class ModalProjectFunnelComponent implements OnChanges {
  private readonly promoterUtils = inject(PromoterUtils);
  private readonly countryUtils = inject(CountryUtils);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedProjectFunnels!: Promoter;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createPromoter = new EventEmitter<{ created?: Promoter, status: 'success' | 'error' }>();
  @Output() deletePromoter = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public isLoading: boolean = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalPromoter = false;
  public abbreviationAlreadyExist = false;
  public name1AlreadyExist = false;
  public countries = toSignal(this.countryUtils.getCountriesSortedByName(), { initialValue: [] })

  public readonly projectFunnelForm = new FormGroup({
    promoterNo: new FormControl<string | null>({ value: null, disabled: true }),
    projectPromoter: new FormControl('', [Validators.required]),
    promoterName1: new FormControl('', [Validators.required]),
    promoterName2: new FormControl(''),
    country: new FormControl(),
    street: new FormControl(''),
    zipCode: new FormControl(''),
    city: new FormControl('')
  });
  constructor(private readonly commonMessageService: CommonMessagesService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (this.isCreateMode) {
        this.loadNextPromoterNo();
      }

      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  onSubmit(): void {
    if (this.projectFunnelForm.invalid || this.isLoading || this.abbreviationAlreadyExist) return

    this.isLoading = true;
    const expectedPromoterNo = this.projectFunnelForm.get('promoterNo')?.value;
    const newPromoter: Omit<Promoter, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      projectPromoter: this.projectFunnelForm.value.projectPromoter?.trim(),
      promoterName1: this.projectFunnelForm.value.promoterName1?.trim(),
      promoterName2: this.projectFunnelForm.value.promoterName2?.trim(),
      country: this.getCountryById(this.projectFunnelForm.value.country ?? 0),
      street: this.projectFunnelForm.value.street?.trim(),
      zipCode: this.projectFunnelForm.value.zipCode?.trim(),
      city: this.projectFunnelForm.value.city?.trim()
    }

    this.promoterUtils.addPromoterWithAutoNumber(newPromoter).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.handlePromoterNoComparison(expectedPromoterNo!, created.promoterNo!);
        this.closeModal();
        this.createPromoter.emit({ created, status: 'success' });
      },
      error: (error) => {
        this.isLoading = false;
        this.handleDuplicateCreateError(error);
      }
    })

    this.projectFunnelForm.get('projectPromoter')?.valueChanges.subscribe(() => {
      if (this.abbreviationAlreadyExist) {
        this.abbreviationAlreadyExist = false;
      }
    });

    this.projectFunnelForm.get('promoterName1')?.valueChanges.subscribe(() => {
      if (this.name1AlreadyExist) {
        this.name1AlreadyExist = false;
      }
    });
  }

  private handleDuplicateCreateError(error: any): void {
    if (error.error?.message?.includes("duplication with")) {
      if (error.error.message.includes(this.projectFunnelForm.value.projectPromoter?.trim())) {
        this.abbreviationAlreadyExist = true;
      }
      if (error.error.message.includes(this.projectFunnelForm.value.promoterName1?.trim())) {
        this.name1AlreadyExist = true;
      }

      this.commonMessageService.showErrorCreatedMessage();

    } else {
      this.createPromoter.emit({ status: 'error' });
    }
  }

  deleteProjectFunnel() {
    this.isLoading = true;
    if (this.selectedProjectFunnels) {
      this.promoterUtils.deletePromoter(this.selectedProjectFunnels.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.deletePromoter.emit({ status: 'success' });
          this.closeModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.handleEntityRelatedError(error);
          this.handleOccDeleteError(error);
        }
      })
    }
  }
  private handleEntityRelatedError(error: any): void {
    if (error.error?.message?.includes('a foreign key constraint fails')) {
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
    } else {
      this.deletePromoter.emit({ status: 'error', error });
    }
  }

  private handleOccDeleteError(error: any): void {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalPromoter = true;
      this.occErrorType = 'DELETE_UNEXISTED';
      this.deletePromoter.emit({ status: 'error', error });
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private getCountryById(id: number): Country | null {
    return this.countries().find(c => c.id === id) ?? null;
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.projectFunnelForm.reset();
    this.abbreviationAlreadyExist = false;
  }

  private loadNextPromoterNo(): void {
    this.promoterUtils.getNextPromoterNo().subscribe({
      next: (nextNo) => {
        if (nextNo) {
          this.projectFunnelForm.patchValue({ promoterNo: nextNo });
        }
      },
      error: (err) => console.error('Error loading next promoterNo', err)
    });
  }

  private handlePromoterNoComparison(expectedPromoterNo: string | undefined, actualPromoterNo: string | undefined): void {
    if (expectedPromoterNo === null) {
      console.log(`Promoter creado con auto-number: ${actualPromoterNo}`);
      return;
    }

    if (expectedPromoterNo !== actualPromoterNo) {
      this.commonMessageService.showInformationMessageUpdatedRecordNumber(actualPromoterNo);
    }
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