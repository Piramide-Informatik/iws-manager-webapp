import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PromoterUtils } from '../../utils/promoter-utils';
import { Promoter } from '../../../../../../Entities/promoter';
import { toSignal } from '@angular/core/rxjs-interop';
import { CountryUtils } from '../../../countries/utils/country-util';
import { Country } from '../../../../../../Entities/country';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

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
  @Output() createPromoter = new EventEmitter<{created?: Promoter, status: 'success' | 'error'}>();
  @Output() deletePromoter = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public isLoading: boolean = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalPromoter = false;
  public countries = toSignal( this.countryUtils.getCountriesSortedByName(), { initialValue: [] } )

  public readonly projectFunnelForm = new FormGroup({
    promoterNo: new FormControl<string | null>(null),
    projectPromoter: new FormControl(''),
    promoterName1: new FormControl(''),
    promoterName2: new FormControl(''),
    country: new FormControl(),
    street: new FormControl(''),
    zipCode: new FormControl(''),
    city: new FormControl('')
  });
  constructor(private readonly commonMessageService: CommonMessagesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  onSubmit(): void {
    if(this.projectFunnelForm.invalid || this.isLoading) return 

    this.isLoading = true;
    const newPromoter: Omit<Promoter, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      promoterNo: this.projectFunnelForm.value.promoterNo?.toString() || null,
      projectPromoter: this.projectFunnelForm.value.projectPromoter?.trim(),
      promoterName1: this.projectFunnelForm.value.promoterName1?.trim(),
      promoterName2: this.projectFunnelForm.value.promoterName2?.trim(),
      country: this.getCountryById(this.projectFunnelForm.value.country ?? 0),
      street: this.projectFunnelForm.value.street?.trim(),
      zipCode: this.projectFunnelForm.value.zipCode?.trim(),
      city: this.projectFunnelForm.value.city?.trim()
    }

    this.promoterUtils.addPromoter(newPromoter).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createPromoter.emit({created, status: 'success'});
      },
      error: () => {
        this.isLoading = false;
        this.createPromoter.emit({ status: 'error',  });
      } 
    })
  }

  deleteProjectFunnel() {
    this.isLoading = true;
    if (this.selectedProjectFunnels) {
      this.promoterUtils.deletePromoter(this.selectedProjectFunnels.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.deletePromoter.emit({status: 'success'});
          this.closeModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.handleEntityRelatedError(error);
          this.handleOccDeleteError(error);
          this.deletePromoter.emit({ status: 'error', error });
        } 
      })
    }
  }
  private handleEntityRelatedError(error: any): void {
    if(error.error?.message?.includes('a foreign key constraint fails')) {
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
    }
  }

  private handleOccDeleteError(error: any): void {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalPromoter= true;
      this.occErrorType = 'DELETE_UNEXISTED';
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
