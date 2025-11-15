import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PromoterUtils } from '../../utils/promoter-utils';
import { CountryUtils } from '../../../countries/utils/country-util';
import { toSignal } from '@angular/core/rxjs-interop';
import { PromoterStateService } from '../../utils/promoter-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';
import { Promoter } from '../../../../../../Entities/promoter';
import { Country } from '../../../../../../Entities/country';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'master-data-edit-project-funnel',
  standalone: false,
  templateUrl: './edit-project-funnel.component.html',
  styleUrl: './edit-project-funnel.component.scss',
})
export class EditProjectFunnelComponent implements OnInit, OnDestroy {
  private readonly promoterUtils = inject(PromoterUtils);
  private readonly promoterStateService = inject(PromoterStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  private readonly countryUtils = inject(CountryUtils);
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  private promoterToEdit: Promoter | null = null;
  public showOCCErrorModaPromoter = false;
  public isLoading: boolean = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public abbreviationAlreadyExist = false;
  public name1AlreadyExist = false;
  public editProjectFunnelForm!: FormGroup;

  public countries = toSignal(this.countryUtils.getCountriesSortedByName(), {
    initialValue: [],
  });

  ngOnInit(): void {
    this.initForm();
    this.setupPromoterSubscription();
    // Check if we need to load a promoter after page refresh for OCC
    const savedPromoterId = localStorage.getItem('selectedPromoterId');
    if (savedPromoterId) {
      this.loadPromoterAfterRefresh(savedPromoterId);
      localStorage.removeItem('selectedPromoterId');
    }

    this.editProjectFunnelForm.get('projectPromoter')?.valueChanges.subscribe(() => {
      if (this.abbreviationAlreadyExist) {
        this.abbreviationAlreadyExist = false;
      }
    });

    this.editProjectFunnelForm.get('promoterName1')?.valueChanges.subscribe(() => {
      if (this.name1AlreadyExist) {
        this.name1AlreadyExist = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.editProjectFunnelForm = new FormGroup({
      promoterNo: new FormControl<string | null>({ value: null, disabled: true }),
      projectPromoter: new FormControl('', [Validators.required]),
      promoterName1: new FormControl('', [Validators.required]),
      promoterName2: new FormControl(''),
      country: new FormControl(),
      street: new FormControl(''),
      zipCode: new FormControl(''),
      city: new FormControl(''),
    });
  }

  onSubmit(): void {
    if (this.editProjectFunnelForm.invalid || !this.promoterToEdit || this.abbreviationAlreadyExist) return;

    this.isLoading = true;
    const editedPromoter: Promoter = {
      ...this.promoterToEdit,
      promoterNo:
        this.promoterToEdit.promoterNo || null,
      projectPromoter: this.editProjectFunnelForm.value.projectPromoter?.trim(),
      promoterName1: this.editProjectFunnelForm.value.promoterName1?.trim(),
      promoterName2: this.editProjectFunnelForm.value.promoterName2?.trim(),
      country: this.getCountryById(
        this.editProjectFunnelForm.value.country ?? 0
      ),
      street: this.editProjectFunnelForm.value.street?.trim(),
      zipCode: this.editProjectFunnelForm.value.zipCode?.trim(),
      city: this.editProjectFunnelForm.value.city?.trim(),
    };

    this.promoterUtils.updatePromoter(editedPromoter).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.handleDuplicateUpdateError(error);
        if (error instanceof OccError) {
          this.showOCCErrorModaPromoter = true;
          this.occErrorType = error.errorType;
          this.commonMessageService.showErrorEditMessage();
        } else {
          this.commonMessageService.showErrorEditMessage();
        }
      },
    });
  }

  private handleDuplicateUpdateError(error: any): void {
    if (error.error?.message?.includes("duplication with")) {
      if (error.error.message.includes(this.editProjectFunnelForm.value.projectPromoter?.trim())) {
        this.abbreviationAlreadyExist = true;
      }
      if (error.error.message.includes(this.editProjectFunnelForm.value.promoterName1?.trim())) {
        this.name1AlreadyExist = true;
      }

    }
  }

  private setupPromoterSubscription(): void {
    this.subscriptions.add(
      this.promoterStateService.currentPromoter$.subscribe((promoter) => {
        if (promoter) {
          console.log('Loaded promoter for editing:', promoter);
          this.promoterToEdit = promoter;
          this.editProjectFunnelForm.patchValue({
            promoterNo: this.promoterToEdit.promoterNo,
            projectPromoter: this.promoterToEdit.projectPromoter,
            promoterName1: this.promoterToEdit.promoterName1,
            promoterName2: this.promoterToEdit.promoterName2,
            country: this.promoterToEdit.country?.id,
            street: this.promoterToEdit.street,
            zipCode: this.promoterToEdit.zipCode,
            city: this.promoterToEdit.city,
          });
          this.focusInputIfNeeded();
        } else {
          this.editProjectFunnelForm.reset();
        }
      })
    );
  }

  private loadPromoterAfterRefresh(promoterId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.promoterUtils.getPromoterById(Number(promoterId)).subscribe({
        next: (promoter) => {
          if (promoter) {
            this.promoterStateService.setPromoterToEdit(promoter);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      })
    );
  }

  private getCountryById(id: number): Country | null {
    return id !== 0 ? this.countries().find((c) => c.id === id) ?? null : null;
  }

  public clearForm(): void {
    this.editProjectFunnelForm.reset();
    this.promoterStateService.clearPromoter();
    this.promoterToEdit = null;
    this.abbreviationAlreadyExist = false;
  }

  public onRefresh(): void {
    if (this.promoterToEdit?.id) {
      localStorage.setItem(
        'selectedPromoterId',
        this.promoterToEdit.id.toString()
      );
      globalThis.location.reload();
    }
  }

  public focusInputIfNeeded(): void {
    if (this.promoterToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}