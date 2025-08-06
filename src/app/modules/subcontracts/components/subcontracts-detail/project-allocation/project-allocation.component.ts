import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { SubcontractProject } from '../../../../../Entities/subcontract-project';
import { MessageService } from 'primeng/api';
import { SubcontractProjectUtils } from '../../../utils/subcontract-project.utils';
import { ActivatedRoute } from '@angular/router';

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
  providers: [MessageService]
})
export class ProjectAllocationComponent implements OnInit, OnDestroy {
  
  private readonly subcontractsProjectUtils = inject(SubcontractProjectUtils);
  private readonly messageService = inject(MessageService);
  
  allocationForm!: FormGroup;
  allocations: ProjectAllocationEntry[] = [];
  modalType: 'create' | 'delete' | 'edit' = 'create';
  currentSubcontractProject!: SubcontractProject;
  public subcontractProjectList!: SubcontractProject[];
  private subscription!: Subscription;

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  visibleModal: boolean = false;

  option = {
    new: 'New',
    edit: 'Edit',
  };
  optionSelected: string = '';
  selectedProjectName!: string;
  allocationsColumns: any[] = [];
  userAllocationsPreferences: UserPreference = {};
  tableKey: string = 'Allocations'
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onUserAllocationsPreferencesChanges(userAllocationsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userAllocationsPreferences));
  }

  showModal(option: string, projectName?: string) {
    this.optionSelected = option;

    if (option === this.option.edit && projectName != null) {
      const entry = this.allocations.find((a) => a.projectName === projectName);
      if (entry) {
        this.allocationForm.setValue({
          projectName: entry.projectName,
          percentage: entry.percentage,
          amount: entry.amount,
        });
        this.selectedProjectName = entry.projectName;
      }
    }

    this.visibleModal = true;
  }

  closeModal() {
    this.visibleModal = false;
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

  handleSubcontractProjectTableEvents(event: { type: 'create' | 'delete' | 'edit', data?: any }): void {
    this.modalType = event.type;

    if (event.type === 'edit') {
      this.currentSubcontractProject = event.data;
    }
    if (event.type === 'delete') {
      const tempSubcontractProject = this.subcontractProjectList.find((subcontractproject) => subcontractproject.id === Number(event.data));
      if (tempSubcontractProject) {
        this.currentSubcontractProject = tempSubcontractProject;
      }
    }
    this.visibleModal = true;
  }

  public messageOperation(message: { severity: string, summary: string, detail: string }): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail))
    })
  }

  onSubcontractProjectDeleted(subcontractprojectId: number) {
    this.subcontractProjectList = this.subcontractProjectList.filter(subcontractproject => subcontractproject.id !== subcontractprojectId);
  }

  onSubcontractProjectUpdated(updated: SubcontractProject): void {
    const index = this.subcontractProjectList.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      this.subcontractProjectList[index] = { ...updated };
      this.subcontractProjectList = [...this.subcontractProjectList];
    }
  }

  onSubcontractProjectCreated(newSubcontractProj: SubcontractProject) {
    this.subcontractProjectList.unshift(newSubcontractProj);
  }

  onModalVisibilityChange(visible: any): void {
    this.visibleModal = visible;
  }
}
