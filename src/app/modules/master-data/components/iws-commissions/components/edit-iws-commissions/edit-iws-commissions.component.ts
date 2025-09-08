import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { IwsCommission } from '../../../../../../Entities/iws-commission ';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IwsCommissionUtils } from '../../utils/iws-commision-utils';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { IwsCommissionStateService } from '../../utils/iws-commision-state.service';

@Component({
  selector: 'app-edit-iws-commissions',
  standalone: false,
  templateUrl: './edit-iws-commissions.component.html',
  styleUrl: './edit-iws-commissions.component.scss',
})
export class EditIwsCommissionsComponent implements OnInit {
  public showOCCErrorModaEmployeeIws = false;
  currentIwsCommission: IwsCommission | null = null;
  editCommissionForm!: FormGroup;

  isSaving = false;
  private readonly subscriptions = new Subscription();
  private readonly editIwsCommissionSource =
    new BehaviorSubject<IwsCommission | null>(null);

  constructor(
    private readonly iwsCommissionUtils: IwsCommissionUtils,
    private readonly iwsCommissionStateService: IwsCommissionStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupIwsCommissionSubscription();

    const savedIwsCommissionId = localStorage.getItem('selectedIwsCommissionId');
    if (savedIwsCommissionId) {
      this.loadIwsCommissionAfterRefresh(savedIwsCommissionId);
      localStorage.removeItem('selectedEmployeeIwsId');
    }
  }

  private initForm(): void {
    this.editCommissionForm = new FormGroup({
      threshold: new FormControl('', []),
      percentage: new FormControl('', []),
      minCommission: new FormControl('', []),
    });
  }

  private setupIwsCommissionSubscription(): void {
    this.subscriptions.add(
      this.iwsCommissionStateService.currentIwsCommission$.subscribe(
        (iwsCommission) => {
          this.currentIwsCommission = iwsCommission;
          iwsCommission
            ? this.loadIwsCommissionData(iwsCommission)
            : this.resetForm(true);
        }
      )
    );
  }

  private loadIwsCommissionData(iwsCommission: IwsCommission): void {
    this.editCommissionForm.patchValue({
      threshold: iwsCommission.fromOrderValue,
      percentage: iwsCommission.commission,
      minCommission: iwsCommission.minCommission,
    });
  }

  private loadIwsCommissionAfterRefresh(iwsCommissionId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.iwsCommissionUtils.getIwsCommissionById(Number(iwsCommissionId)).subscribe({
        next: (iwsCommission) => {
          if (iwsCommission) {
            this.iwsCommissionStateService.setIwsCommissionToEdit(iwsCommission);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        },
      })
    );
  }

  onSubmit(): void {
    if (
      this.editCommissionForm.invalid ||
      !this.currentIwsCommission ||
      this.isSaving
    ) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updateIwsCommission: IwsCommission = {
      ...this.currentIwsCommission,
      fromOrderValue: this.editCommissionForm.value.threshold,
      commission: this.editCommissionForm.value.percentage,
      minCommission: this.editCommissionForm.value.minCommission,
    };

    this.subscriptions.add(
      this.iwsCommissionUtils.updateIwsCommission(updateIwsCommission).subscribe({
        next: (savedCommission) => this.handleSaveSuccess(savedCommission),
        error: (err) => this.handleError(err),
      })
    );

    console.log(
      this.editCommissionForm.valid
        ? this.editCommissionForm.value
        : 'Formulario inválido'
    );
  }

  private markAllAsTouched(): void {
    Object.values(this.editCommissionForm.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleSaveSuccess(savedIwsCommission: IwsCommission): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS'),
    });
    this.iwsCommissionStateService.setIwsCommissionToEdit(null);
    this.resetForm(true);
  }

  private handleError(err: any): void {
    if (
      err.message ===
      'Version conflict: IwsCommission has been updated by another user'
    ) {
      this.showOCCErrorModaEmployeeIws = true;
    } else {
      console.error('Error saving iwsCommission:', err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('MESSAGE.UPDATE_FAILED'),
      });
    }
    this.isSaving = false;
  }

  cancelEdit(): void {
    console.log('Edición cancelada');
    this.resetForm();
  }

  private resetForm(clearCommission = false): void {
    this.editCommissionForm.reset();
    if (clearCommission) {
      this.currentIwsCommission = null;
      this.isSaving = false;
    }
  }

  onRefresh(): void {
    if (this.currentIwsCommission?.id) {
      localStorage.setItem(
        'selectedPublicHolidayId',
        this.currentIwsCommission.id.toString()
      );
      window.location.reload();
    }
  }
}
