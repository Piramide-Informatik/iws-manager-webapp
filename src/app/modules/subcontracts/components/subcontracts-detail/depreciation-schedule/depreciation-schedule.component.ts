import { Component, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Table } from 'primeng/table';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SubcontractYearUtils } from '../../../utils/subcontract-year-utils';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { ActivatedRoute } from '@angular/router';
import { SubcontractYear } from '../../../../../Entities/subcontract-year';
import { Subcontract } from '../../../../../Entities/subcontract';
import { momentCreateDate, momentFormatDate } from '../../../../shared/utils/moment-date-utils';
import { SubcontractStateService } from '../../../utils/subcontract-state.service';
import { DatePicker } from 'primeng/datepicker';

interface DepreciationEntry {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;
  year: string;
  usagePercentage: number;
  depreciationAmount: number;
}

@Component({
  selector: 'app-depreciation-schedule',
  standalone: false,
  templateUrl: './depreciation-schedule.component.html',
  styleUrl: './depreciation-schedule.component.scss',
})
export class DepreciationScheduleComponent implements OnInit {
  private readonly subcontractYearUtils = inject(SubcontractYearUtils);
  private readonly subcontractStateService = inject(SubcontractStateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private langSubscription = new Subscription();
  public showOCCErrorModalDepreciation = false;
  visibleSubcontractYearModal = false;
  
  @Input() currentSubcontract!: Subcontract;

  depreciationForm!: FormGroup;
  subcontractsYear: DepreciationEntry[] = [];

  visibleModal = signal(false);
  modalType: 'new' | 'edit' | 'delete' = 'new';
  @ViewChild('datePicker') firstInput!: DatePicker;

  public selectedSubcontractYear!: DepreciationEntry | undefined;
  subcontractId!: number;
  isLoading: boolean = false;

  // Configuration table Subcontract Year
  @ViewChild('dt') dt!: Table;
  depreciationColumns: any[] = [];
  userDepreciationPreferences: UserPreference = {};
  tableKey: string = 'DepreciationSchedule'
  dataKeys = ['year', 'usagePercentage', 'depreciationAmount']

  constructor() { }

  ngOnInit(): void {
    this.subcontractStateService.currentSubcontract$.subscribe((updatedSubcontract) => {
      if(updatedSubcontract && (updatedSubcontract?.invoiceNet !== this.currentSubcontract.invoiceNet || 
        updatedSubcontract.afamonths !== this.currentSubcontract.afamonths )){
        this.loadSubcontractYears(updatedSubcontract.id)
      }
    });
    this.route.params.subscribe(params => {
      this.subcontractId = params['subContractId'];
      this.loadSubcontractYears(this.subcontractId);  
    })
    this.initForm();
    this.inputMonthsChange();

    this.loadColumns();
    this.userDepreciationPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.depreciationColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumns();
      this.userDepreciationPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.depreciationColumns);
    });
  }

  private initForm(): void {
    this.depreciationForm = new FormGroup({
      year: new FormControl(''),
      months: new FormControl(null),
      depreciationAmount: new FormControl(null),
    });
    this.depreciationForm.get('depreciationAmount')?.disable();
  }

  private inputMonthsChange(): void {
    this.depreciationForm.get('months')?.valueChanges.subscribe(value => {
      const months = value ?? 0;
      const invoiceNet = this.currentSubcontract?.invoiceNet ?? 0;
      const afamonths = this.currentSubcontract?.afamonths ?? 0;
      const depreciationAmount = this.calculateDepreciationAmount(invoiceNet, afamonths, months);
      this.depreciationForm.get('depreciationAmount')?.setValue(depreciationAmount, { emitEvent: false });
    });
  }

  onUserDepreciationPreferencesChanges(userDepreciationPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userDepreciationPreferences));
  }

  loadColumns() {
    this.depreciationColumns = [
      { field: 'year', customClasses: ['align-right'], type: 'dateYear', header: this.translate.instant(_('SUB-CONTRACTS.DEPRECIATION_COLUMNS.YEAR')) },
      { field: 'usagePercentage', customClasses: ['align-right'], header: this.translate.instant(_('SUB-CONTRACTS.DEPRECIATION_COLUMNS.SERVICE_LIFE')) },
      { field: 'depreciationAmount', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('SUB-CONTRACTS.DEPRECIATION_COLUMNS.AFA_BY_YEAR')) },
    ];
  }

  showModal(option: 'new' | 'edit' | 'delete', idSubcontracYear?: number) {
    if(option !== 'delete'){
      this.firstInputFocus();
    }
    this.modalType = option;
    if( option === 'delete' || option === 'edit' ) {
      this.selectedSubcontractYear = this.subcontractsYear.find(e => e.id === idSubcontracYear);
    }
    if (option === 'edit') {
      if (this.selectedSubcontractYear) {
        this.depreciationForm.patchValue({
          year: momentCreateDate(this.selectedSubcontractYear.year),
          months: this.selectedSubcontractYear.usagePercentage,
          depreciationAmount: this.selectedSubcontractYear.depreciationAmount
        });
      }
    }

    this.visibleModal.set(true);
  }

  closeModal() {
    this.isLoading = false;
    this.visibleModal.set(false);
    this.depreciationForm.reset();
    this.visibleSubcontractYearModal = false;
  }

  private calculateDepreciationAmount(invoiceNet: number, afamonths: number, months: number): number {
    return afamonths === 0 || months === 0 ? 0 : invoiceNet / (afamonths * months);
  }

  public onSubmit(): void {
    if (this.modalType === 'new'){
      this.createSubcontractYear();
    } else if (this.modalType === 'edit'){
      this.updateSubcontractYear();
    }
  }

  private updateSubcontractYear(): void {
    if (this.depreciationForm.invalid || !this.selectedSubcontractYear) return;

    const updatedSubcontractYear: SubcontractYear = {
      id: this.selectedSubcontractYear.id,
      year: this.depreciationForm.value.year,
      months: this.depreciationForm.value.months,
      subcontract: this.currentSubcontract, 
      createdAt: this.selectedSubcontractYear.createdAt,
      updatedAt: new Date().toISOString(),
      version: this.selectedSubcontractYear.version
    };

    this.isLoading = true;
    this.subcontractYearUtils.updateSubcontractYear(updatedSubcontractYear).subscribe({
      next: () => {
        this.closeModal();
        this.commonMessageService.showEditSucessfullMessage();
        this.loadSubcontractYears(this.subcontractId);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.message === 'Conflict detected: subcontract year version mismatch') {
          this.showOCCErrorModalDepreciation = true;
        } else {
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  private createSubcontractYear(): void {
    if (this.depreciationForm.invalid) return;

    const newSubcontractYear: Omit<SubcontractYear, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      year: momentFormatDate(this.depreciationForm.value.year),
      months: this.depreciationForm.value.months,
      subcontract: { 
        id: this.currentSubcontract.id,
        version: 0
      } as Subcontract, 
    };
    
    this.isLoading = true;
    this.subcontractYearUtils.createNewSubcontractYear(newSubcontractYear).subscribe({
      next: () => {
        this.closeModal();
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.loadSubcontractYears(this.subcontractId);
      },
      error: () => {
        this.isLoading = false;
        this.commonMessageService.showErrorCreatedMessage();
      }
    });
  }

  public removeSubcontractYear() {
    if (this.selectedSubcontractYear) {
      this.isLoading = true;
      this.subcontractYearUtils.deleteSubcontractYear(this.selectedSubcontractYear.id).subscribe({
        next: () => {
          this.closeModal();
          this.commonMessageService.showDeleteSucessfullMessage();
          this.subcontractsYear = this.subcontractsYear.filter( de => de.id !== this.selectedSubcontractYear?.id);
          this.selectedSubcontractYear = undefined;
        },
        error: () => {
          this.closeModal();
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }

  private loadSubcontractYears(subcontractId: number): void {
    this.subcontractYearUtils.getAllSubcontractsYearSortedByYear(subcontractId).subscribe( sc => {
      this.subcontractsYear = sc.reduce((acc: any, curr: SubcontractYear) => {
        const invoiceNet = curr.subcontract?.invoiceNet ?? 0;
        const afamonths = curr.subcontract?.afamonths ?? 0;
        const subcontractsYearMonths = curr.months;
        acc.push({
          id: curr.id,
          createdAt: curr.createdAt,
          updatedAt: curr.updatedAt,
          version: curr.version,
          year: curr.year,
          usagePercentage: curr.months,
          depreciationAmount: this.calculateDepreciationAmount(invoiceNet, afamonths, subcontractsYearMonths)
        } as DepreciationEntry);
          return acc;  
      }, [])
    });
  }

  private firstInputFocus(): void {
    setTimeout(()=>{
      if(this.firstInput.inputfieldViewChild){
        this.firstInput.inputfieldViewChild.nativeElement.focus();
      }
    },300)
  }
}
