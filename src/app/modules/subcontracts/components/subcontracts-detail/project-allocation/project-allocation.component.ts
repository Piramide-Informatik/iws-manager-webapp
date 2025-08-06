import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { SubcontractProjectUtils } from '../../../utils/subcontract-project.utils';
import { ActivatedRoute } from '@angular/router';
import { SubcontractProject } from '../../../../../Entities/subcontract-project';

interface ProjectAllocationEntry {
  id: number;
  projectName: string;
  percentage: number;
  amount: number;
}

@Component({
  selector: 'app-project-allocation',
  standalone: false,
  templateUrl: './project-allocation.component.html',
  styleUrl: './project-allocation.component.scss',
})
export class ProjectAllocationComponent implements OnInit {
  private readonly subcontractsProjectUtils = inject(SubcontractProjectUtils)
  allocationForm!: FormGroup;
  allocations: ProjectAllocationEntry[] = [];

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;

  visibleModal = signal(false);
  option = {
    new: 'New',
    edit: 'Edit',
    delete: 'Delete'
  };
  optionSelected: string = '';
  selectedProjectName!: string;
  selectedSubcontractProject!: ProjectAllocationEntry | undefined;
  allocationsColumns: any[] = [];
  userAllocationsPreferences: UserPreference = {};
  tableKey: string = 'Allocations'
  modalType!: string;
  dataKeys = ['projectName', 'percentage', 'amount'];
  subcontractId!: number;
  private langSubscription!: Subscription;

  constructor(
    private readonly userPreferenceService: UserPreferenceService,
    private readonly translate: TranslateService,
    private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    
     this.route.params.subscribe(params => {
      this.subcontractId = params['subContractId'];
      this.subcontractsProjectUtils.getAllSubcontractsProject(this.subcontractId).subscribe( sc => {
        this.allocations = sc.reduce((acc: any[], curr: SubcontractProject) => {
          acc.push({
            id: curr.id,
            projectName: curr.project?.projectName,
            percentage: curr.project?.shareResearch,
            amount: curr.amount ?? 0
          });
          return acc;
        }, []);
      })  
    })


    this.allocationForm = new FormGroup({
      projectName: new FormControl('', Validators.required),
      percentage: new FormControl('', Validators.required),
      amount: new FormControl('', Validators.required),
    });

    this.loadColumns()
    this.userAllocationsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.allocationsColumns);
    this.loading = false;
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumns();
      this.userAllocationsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.allocationsColumns);
    });
  }

  loadColumns() {
    this.allocationsColumns = [
      { field: 'projectName', header: this.translate.instant(_('SUB-CONTRACTS.PROJECT.PROJECT')) },
      { field: 'percentage', customClasses: ['align-right'], header: this.translate.instant(_('SUB-CONTRACTS.PROJECT.SHARE')) },
      { field: 'amount', customClasses: ['align-right'], header: this.translate.instant(_('SUB-CONTRACTS.PROJECT.AMOUNT')) },
    ];
  }

  onUserAllocationsPreferencesChanges(userAllocationsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userAllocationsPreferences));
  }

  handleEmployeeTableEvents(event: { type: 'create' | 'edit' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      const projectAllocationEntry = this.allocations.find( allocation => allocation.id === event.data);
      if (projectAllocationEntry) {
        this.selectedSubcontractProject = projectAllocationEntry;
      }
    }
    this.visibleModal.set(true);
  }

  closeModal() {
    this.visibleModal.set(false);
    this.allocationForm.reset();
    this.optionSelected = '';
  }

  saveAllocation() {
    if (this.allocationForm.invalid) return;

    const data = this.allocationForm.value;

    if (this.optionSelected === this.option.new) {
      this.allocations.push(data);
    } else if (this.optionSelected === this.option.edit) {
      this.allocations = this.allocations.map((entry) =>
        entry.projectName === this.selectedProjectName ? data : entry
      );
    }

    this.closeModal();
  }

  deleteAllocation(projectName: any) {
    this.allocations = this.allocations.filter(
      (entry) => entry.projectName !== projectName
    );
  }

  onSubcontractProjectModalVisible(isVisible: boolean) {
    this.visibleModal.set(isVisible);
  }

  onSubcontractProjecteDeleted(subContractProject: SubcontractProject) {
    this.allocations = this.allocations.filter( sp => sp.id !== subContractProject.id);
    this.selectedSubcontractProject = undefined;
  }
}
