import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BillerUtils } from '../../utils/biller-utils';
import { BillerStateService } from '../../utils/biller-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';
import { Biller } from '../../../../../../Entities/biller';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'master-data-edit-biller',
  standalone: false,
  templateUrl: './edit-biller.component.html',
  styleUrl: './edit-biller.component.scss'
})
export class EditBillerComponent implements OnInit, OnDestroy {
  private readonly billerUtils = inject(BillerUtils);
  private readonly billerStateService = inject(BillerStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  private billerToEdit: Biller | null = null;
  public showOCCErrorModaBiller = false;
  public isLoading: boolean = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  editBillerForm!: FormGroup;

  ngOnInit(): void {
    this.editBillerForm = new FormGroup({
      name: new FormControl(''),
    });
    this.setupBillerSubscription();
    // Check if we need to load a biller after page refresh for OCC
    const savedBillerId = localStorage.getItem('selectedBillerId');
    if (savedBillerId) {
      this.loadBillerAfterRefresh(savedBillerId);
      localStorage.removeItem('selectedBillerId');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.editBillerForm.invalid || !this.billerToEdit) return

    this.isLoading = true;
    const editedBiller: Biller = {
      ...this.billerToEdit,
      name: this.editBillerForm.value.name?.trim()
    };

    this.billerUtils.updateBiller(editedBiller).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error) => {
        this.isLoading = false;
        this.handleOccError(error);
        this.commonMessageService.showErrorEditMessage();
      }
    });
  }

  private handleOccError(error: any): void {
    if (error instanceof OccError) {
      console.log("tipo de error: ", error.errorType)
      this.showOCCErrorModaBiller = true;
      this.occErrorType = error.errorType;
    }
  }

  public onRefresh(): void {
    if (this.billerToEdit?.id) {
      localStorage.setItem('selectedBillerId', this.billerToEdit.id.toString());
      window.location.reload();
    }
  }

  public clearForm(): void {
    this.editBillerForm.reset();
    this.billerStateService.clearBiller();
    this.billerToEdit = null;
  }

  private setupBillerSubscription(): void {
    this.subscriptions.add(
      this.billerStateService.currentBiller$.subscribe(biller => {
        if (biller) {
          this.billerToEdit = biller;
          this.editBillerForm.patchValue({
            name: this.billerToEdit.name
          });
          this.focusInputIfNeeded();
        } else {
          this.editBillerForm.reset();
        }
      })
    )
  }

  private loadBillerAfterRefresh(billerId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.billerUtils.getBillerById(Number(billerId)).subscribe({
        next: (biller) => {
          if (biller) {
            this.billerStateService.setBillerToEdit(biller);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          console.log('error reload')
        }
      })
    );
  }

  private focusInputIfNeeded(): void {
    if (this.billerToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
