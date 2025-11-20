import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderCommission } from '../../../../../../../Entities/orderCommission';
import { Table } from 'primeng/table';
import { UserPreferenceService } from '../../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../../Entities/user-preference';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Order } from '../../../../../../../Entities/order';
import { InputNumber } from 'primeng/inputnumber';
import { OrderCommissionUtils } from '../../../utils/order-commission-utils';
import { CommonMessagesService } from '../../../../../../../Services/common-messages.service';
import { Column } from '../../../../../../../Entities/column';
import { FormStateService } from '../../../utils/form-state.service';
import { OccError, OccErrorType } from '../../../../../../shared/utils/occ-error';

interface OrderCommissionForm {
  fixCommission: number;
  maxCommission: number;
  iwsProvision: number;
}

@Component({
  selector: 'app-iws-provision',
  standalone: false,
  templateUrl: './iws-provision.component.html',
  styleUrl: './iws-provision.component.scss'
})
export class IwsProvisionComponent implements OnInit, OnDestroy, OnChanges {
  private readonly orderCommissionUtils = inject(OrderCommissionUtils);
  private readonly formStateService = inject(FormStateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly translate = inject(TranslateService);
  private readonly subscriptions = new Subscription();

  // Order 
  orderCommissionForm!: OrderCommissionForm;
  currentOrderValueForm: number | null = null;
  @Input() orderToEdit!: Order;
  @Output() onCreateOrderCommission = new EventEmitter<OrderCommissionForm>();

  // Forms
  public orderForm: FormGroup = new FormGroup({
    fixCommission: new FormControl(null, [Validators.min(0), Validators.max(999.99)]),
    maxCommission: new FormControl(null),
    iwsProvision: new FormControl(null),
  });

  public iwsCommissionForm: FormGroup = new FormGroup({
    fromOrderValue: new FormControl(null),
    commission: new FormControl(null, [Validators.min(0), Validators.max(100)]),
    minCommission: new FormControl(null)
  });

  public disabledButtonsTable: boolean = false;
  selectedOrderCommission!: OrderCommission | undefined;
  orderCommissions: OrderCommission[] = [];
  public showOCCErrorModalOrderCommission: boolean = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  
  // Configuration Modal
  visibleModalIWSCommission = false;
  visibleModalIWSCommissionEntity = false;
  isLoading: boolean = false;
  isLoadingDelete: boolean = false;
  typeModal: 'create' | 'edit' | 'delete' = 'create';
  @ViewChild('inputNumber') firstInput!: InputNumber;

  // Configuration Table IWS commission
  @ViewChild('dt') dt!: Table;
  cols!: Column[];
  userIwsProvisionPreferences: UserPreference = {};
  tableKey: string = 'IwsProvision'
  dataKeys = ['fromOrderValue', 'commission', 'minCommission'];
  private langSubscription!: Subscription;
  disableCreateCommission = true;

  ngOnInit(): void {
    this.orderForm.get('iwsProvision')?.disable();
    this.changeInputOrderForm();
    this.subscriptions.add(
      this.formStateService.orderValue$.subscribe((value) => {
        this.currentOrderValueForm = value;
        this.calculateIwsProvision();
      })
    );
    this.loadColumns();
    this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumns();
      this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);
    });

    if (this.orderToEdit) {
     this.orderCommissionUtils.getAllOrderCommissionsByOrderIdSortedByFromOrderValue(this.orderToEdit.id).subscribe( orderComissions => {
      this.orderCommissions = orderComissions;
     })
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderToEdit'] && this.orderToEdit) {
      this.disableCreateCommission = false;
      this.orderForm.patchValue({
        fixCommission: this.orderToEdit.fixCommission,
        maxCommission: this.orderToEdit.maxCommission,
        iwsProvision: this.orderToEdit.iwsProvision
      });
      this.orderCommissionUtils.getAllOrderCommissionsByOrderIdSortedByFromOrderValue(this.orderToEdit.id).subscribe( orderComissions => {
       this.orderCommissions = orderComissions;
       this.calculateIwsProvision();
      })
    }
  }

  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
    this.subscriptions.unsubscribe();
    this.formStateService.clearOrderValue();
  }

  private changeInputOrderForm(): void {
    // Cambiar el estado del formulario según la comisión fija
    this.subscriptions.add(
      this.orderForm.get('fixCommission')?.valueChanges.subscribe((valueFixCommission: number | null) => {
        if (valueFixCommission && valueFixCommission > 0){
          this.orderForm.get('maxCommission')?.disable();
          this.disabledButtonsTable = true;
          this.orderForm.get('iwsProvision')?.setValue(valueFixCommission, { emitEvent: false });
          this.orderForm.get('maxCommission')?.setValue(null, { emitEvent: false })
        } else {
          this.orderForm.get('maxCommission')?.enable();
          this.disabledButtonsTable = false;
          this.calculateIwsProvision();
        }
      })
    );

    // Cambiar el estado del formulario según la comisión maxima
    this.subscriptions.add(
      this.orderForm.get('maxCommission')?.valueChanges.subscribe((valueMaxCommission: number | null) => {
        if (valueMaxCommission && valueMaxCommission > 0){
          this.calculateIwsProvision();
        }
      })
    );
  }

  private calculateIwsProvision(): void {
    const currentValue = this.currentOrderValueForm;

    const fixCommission = this.orderForm.get('fixCommission')?.value;
    if (fixCommission && fixCommission > 0)  return;

    if (!currentValue || currentValue <= 0 || !this.orderCommissions?.length) {
      this.orderForm.get('iwsProvision')?.setValue(0 , { emitEvent: false });
      return;
    }

    // Buscar el rango adecuado
    let selectedCommission: OrderCommission | null = null;
    
    for (let i = this.orderCommissions.length - 1; i >= 0; i--) {
      const commission = this.orderCommissions[i];
      if (commission.fromOrderValue !== undefined && 
          currentValue >= commission.fromOrderValue) {
        selectedCommission = commission;
        break;
      }
    }

    // Si no se encontró, usar el primero
    selectedCommission = selectedCommission ?? this.orderCommissions[0];

    // Calcular y aplicar comisión mínima
    let provision = 0;
    if (selectedCommission.commission !== undefined) {
      provision = currentValue * (selectedCommission.commission / 100);
    }

    if (selectedCommission.minCommission !== undefined && 
        provision < selectedCommission.minCommission) {
      provision = selectedCommission.minCommission;
    }

    // Aplicar comisión máxima si existe
    const maxCommission = this.orderForm.get('maxCommission')?.value;
    if (maxCommission && maxCommission > 0 && provision > maxCommission) {
      provision = maxCommission;
    }
    this.orderForm.get('iwsProvision')?.setValue(Number(provision.toFixed(2)), { emitEvent: false }); 
  }

  onUserIwsProvisionPreferencesChanges(userIwsProvisionPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsProvisionPreferences));
  }

  loadColumns() {
  this.cols = [
    {
      field: 'fromOrderValue',
      customClasses: ['align-right'],
      styles: { width: 'auto' },
      type: 'double',
      useSameAsEdit: true,
      header: this.translate.instant(_('ORDERS.COMMISSIONS.FROM_VALUE')),
    },
    {
      field: 'commission',
      customClasses: ['align-right'],
      styles: { width: 'auto' },
      type: 'double',
      header: this.translate.instant(_('ORDERS.COMMISSIONS.COMMISSION')),
    },
    {
      field: 'minCommission',
      customClasses: ['align-right'],
      styles: { width: 'auto' },
      type: 'double',
      header: this.translate.instant(_('ORDERS.COMMISSIONS.MIN_COMMISSION')),
    },
  ];
  }

  public onSubmit(): void {
    if (this.orderForm.invalid) return
    
    this.orderCommissionForm = {
      fixCommission: this.orderForm.value.fixCommission ?? 0,
      maxCommission: this.orderForm.value.maxCommission ?? 0,
      iwsProvision: this.orderForm.getRawValue().iwsProvision ?? 0
    }

    this.onCreateOrderCommission.emit(this.orderCommissionForm);
  }

  public clearIwsCommissionForm(): void {
    this.orderForm.reset();
  }

  onSubmitIwsCommission(){
    if(this.iwsCommissionForm.invalid) return;
    
    if(this.typeModal === 'create'){
      this.createOrderCommission();
    }else if(this.typeModal === 'edit' && this.selectedOrderCommission){
      this.updateOrderCommission();
    }
  }

  private createOrderCommission(): void {
    const newOrderCommission: Omit<OrderCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      fromOrderValue: this.iwsCommissionForm.value.fromOrderValue ?? 0,
      commission: this.iwsCommissionForm.value.commission ?? 0,
      minCommission: this.iwsCommissionForm.value.minCommission ?? 0,
      order: this.orderToEdit
    }
    
    this.isLoading = true;
    this.orderCommissionUtils.createOrderCommission(newOrderCommission).subscribe({
      next: () => {
        this.isLoading = false;
        this.orderCommissionUtils.getAllOrderCommissionsByOrderIdSortedByFromOrderValue(this.orderToEdit.id).subscribe( orderComissions => {
          this.orderCommissions = orderComissions;
          this.calculateIwsProvision();
        })
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.closeModalIwsCommission();
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error);
        this.commonMessageService.showErrorCreatedMessage();
      }
    })
  }

  private updateOrderCommission(): void {
    const updateOrderCommission: OrderCommission = {
      ...this.selectedOrderCommission!,
      fromOrderValue: this.iwsCommissionForm.value.fromOrderValue ?? 0,
      commission: this.iwsCommissionForm.value.commission ?? 0,
      minCommission: this.iwsCommissionForm.value.minCommission ?? 0,
    }

    this.isLoading = true;
    this.orderCommissionUtils.updateOrderCommission(updateOrderCommission).subscribe({
      next: (updated) => {
        this.isLoading = false;
        this.commonMessageService.showEditSucessfullMessage();
        this.orderCommissions = this.orderCommissions.map(c => c.id === updated.id ? updated : c);
        this.closeModalIwsCommission();
        this.calculateIwsProvision();
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.commonMessageService.showErrorEditMessage();
        this.closeModalIwsCommission();
        if(error instanceof OccError){
          this.showOCCErrorModalOrderCommission = true;
          this.occErrorType = error.errorType;
        }
      }
    })
  }

  showModalIwsCommission(type: 'create' | 'edit' | 'delete', data?: OrderCommission){
    this.firstInputFocus();
    this.typeModal = type;
    
    if(data && this.typeModal === 'edit'){
      this.selectedOrderCommission = data;
      this.iwsCommissionForm.get('fromOrderValue')?.setValue(data?.fromOrderValue);
      this.iwsCommissionForm.get('commission')?.setValue(data?.commission);
      this.iwsCommissionForm.get('minCommission')?.setValue(data?.minCommission);
    }

    this.visibleModalIWSCommission = true;
  }

  closeModalIwsCommission(){
    this.visibleModalIWSCommission = false;
    this.iwsCommissionForm.reset();
    this.selectedOrderCommission = undefined;
  }

  deleteCommission(id: number){
    this.typeModal = 'delete';
    this.selectedOrderCommission = this.orderCommissions.find(oc => oc.id == id);
    this.visibleModalIWSCommission = true;
  }

  onIwsCommissionDeleteConfirm() {
    this.isLoadingDelete = true;

    if (this.selectedOrderCommission) {
      this.orderCommissionUtils.deleteOrderCommission(this.selectedOrderCommission.id).subscribe({
        next: () => {
          this.isLoadingDelete = false;
          this.visibleModalIWSCommission = false;
          this.visibleModalIWSCommissionEntity = false;
          this.orderCommissions = this.orderCommissions.filter(c => c.id !== this.selectedOrderCommission!.id);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.calculateIwsProvision();
        },
        error: (error) => {
          this.isLoadingDelete = false;
          this.visibleModalIWSCommission = false;
          this.visibleModalIWSCommissionEntity = false;
          this.commonMessageService.showErrorDeleteMessage();
          this.handleDeleteError(error);
        }
      });
    }
  }

  private handleDeleteError(error: any): void {
    if (error instanceof OccError || error?.message?.includes('404') ) {
      this.occErrorType = 'DELETE_UNEXISTED';
      this.showOCCErrorModalOrderCommission = true;
    }
  }

  private firstInputFocus(): void {
    setTimeout(()=>{
      if(this.firstInput.input.nativeElement){
        this.firstInput.input.nativeElement.focus();
      }
    },300)
  }
}
