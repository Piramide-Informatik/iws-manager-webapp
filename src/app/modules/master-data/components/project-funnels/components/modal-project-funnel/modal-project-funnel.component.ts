import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PromoterUtils } from '../../utils/promoter-utils';
import { Promoter } from '../../../../../../Entities/promoter';
import { toSignal } from '@angular/core/rxjs-interop';
import { CountryUtils } from '../../../countries/utils/country-util';
import { Country } from '../../../../../../Entities/country';

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
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createPromoter = new EventEmitter<{created?: Promoter, status: 'success' | 'error'}>();
  @Output() deletePromoter = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public isLoading: boolean = false;

  public countries = toSignal( this.countryUtils.getCountriesSortedByName(), { initialValue: [] } )

  public readonly projectFunnelForm = new FormGroup({
    promoterNo: new FormControl(''),
    projectPromoter: new FormControl(''),
    promoterName1: new FormControl(''),
    promoterName2: new FormControl(''),
    country: new FormControl(),
    street: new FormControl(''),
    zipCode: new FormControl(''),
    city: new FormControl('')
  });

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.modalType === 'create'){
      this.focusInputIfNeeded();
    }
  }

  onSubmit(): void {
    if(this.projectFunnelForm.invalid || this.isLoading) return 

    this.isLoading = true;
    const newPromoter: Omit<Promoter, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      promoterNo: this.projectFunnelForm.value.promoterNo ?? '',
      projectPromoter: this.projectFunnelForm.value.projectPromoter ?? '',
      promoterName1: this.projectFunnelForm.value.promoterName1 ?? '',
      promoterName2: this.projectFunnelForm.value.promoterName2 ?? '',
      country: this.getCountryById(this.projectFunnelForm.value.country ?? 0),
      street: this.projectFunnelForm.value.street ?? '',
      zipCode: this.projectFunnelForm.value.zipCode ?? '',
      city: this.projectFunnelForm.value.city ?? ''
    }

    this.promoterUtils.addPromoter(newPromoter).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createPromoter.emit({created, status: 'success'});
      },
      error: () => {
        this.isLoading = false;
        this.createPromoter.emit({ status: 'error' });
      } 
    })
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
