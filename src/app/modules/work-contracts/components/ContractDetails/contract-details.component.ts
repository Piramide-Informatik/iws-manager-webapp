import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { EmploymentContractUtils } from '../../../employee/utils/employment-contract-utils';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnDestroy {

  private readonly subscription = new Subscription();
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly employeeContractUtils = inject(EmploymentContractUtils)

  public showOCCErrorModalContract = false;

  ContractDetailsForm!: FormGroup;
  @Input() modalType: string = "create";
  employeeNumber: any;
  @Input() workContract!: any;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() deletedEmployeeContract = new EventEmitter<any>();
  isDeleteEmployeeContract: boolean = false;

  isLoading = false;
  errorMsg: string | null = null;
  @Output() onContractCreated = new EventEmitter<number>();

  constructor( private readonly commonMessageService: CommonMessagesService) {}


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    if (!this.ContractDetailsForm) {
      this.initContractDetailsForm();
    }
  }

  private initContractDetailsForm(): void {
    this.ContractDetailsForm = new FormGroup({
      datum: new FormControl('', []),
      gehalt: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^[0-9]{1,5}(\.[0-9]{1,2})?$/)]),
      wochenstunden: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^[0-9]{1,5}(\.[0-9]{1,2})?$/)]),
      kurz: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^[0-9]{1,5}(\.[0-9]{1,2})?$/)]),
      jahresauszahlung: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^[0-9]{1,5}(\.[0-9]{1,2})?$/)]),
      maxstudenmonat: new FormControl(null, []),
      maxstudentag: new FormControl(null, []),
      stundensatz: new FormControl(null, []),
      lastName: new FormControl('', []),
      firstName: new FormControl('', []),
      employeNro: new FormControl('', []),
    });
    this.ContractDetailsForm.get("firstName")?.disable();
    this.ContractDetailsForm.get("lastName")?.disable();
    this.ContractDetailsForm.get("stundensatz")?.disable();
    this.ContractDetailsForm.get("maxstudentag")?.disable();
    this.ContractDetailsForm.get("maxstudenmonat")?.disable();
  }

  onSubmit() {
    if (this.modalType === 'create') {
      this.createWorkContract();
    } else if (this.modalType === 'edit') {
      this.updateWorkContract();
    }
  }

  createWorkContract() {
    if (this.ContractDetailsForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMsg = null;

    const newWorkContract = {
      startDate: this.ContractDetailsForm.value.datum,
      salaryPerMonth: this.ContractDetailsForm.value.gehalt ?? '',
      hoursPerWeek: this.ContractDetailsForm.value.wochenstunden ?? '',
      workShortTime: this.ContractDetailsForm.value.kurz ?? '',
      specialPayment: this.ContractDetailsForm.value.jahresauszahlung ?? '',
      maxHoursPerMonth: this.ContractDetailsForm.value.maxstudenmonat ?? '',
      maxHoursPerDay: this.ContractDetailsForm.value.maxstudentag ?? '',
      hourlyRate: this.ContractDetailsForm.value.stundensatz ?? '',
      employee: this.ContractDetailsForm.value.employeNro,
      customer: this.workContract?.customer ?? null
    };

    this.employeeContractUtils.createNewEmploymentContract(newWorkContract).subscribe({
      next: () => {
        this.isLoading = false;
        this.onContractCreated.emit(this.ContractDetailsForm.value.employeNro);
        this.isVisibleModal.emit(false);
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.ContractDetailsForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMsg = error.message;
        this.isVisibleModal.emit(false);
        this.commonMessageService.showErrorCreatedMessage();
        this.ContractDetailsForm.reset();
      }
    });
  }

  updateWorkContract() {
    // Implementar lógica de actualización si es necesario
  }

  goBackListContracts() {
    this.isVisibleModal.emit(false);
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.ContractDetailsForm.reset();
  }

  deleteEmployeeContract() {
    if (this.workContract) {
      this.isDeleteEmployeeContract = true;
      this.employeeContractUtils.deleteEmploymentContract(this.workContract.id).subscribe({
        next: () => {
          this.isDeleteEmployeeContract = false;
          this.isVisibleModal.emit(false);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.deletedEmployeeContract.emit(this.workContract);
        },
        error: (error) => {
          this.isDeleteEmployeeContract = false;
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }
}
