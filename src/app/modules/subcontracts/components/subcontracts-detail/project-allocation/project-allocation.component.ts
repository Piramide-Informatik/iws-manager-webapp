import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Table } from 'primeng/table'; 
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { SubcontractProject } from '../../../../../Entities/subcontract-project';
import { SubcontractProjectUtils } from '../../../utils/subcontract-project.utils';
import { ActivatedRoute } from '@angular/router';
import { SubcontractStateService } from '../../../utils/subcontract-state.service';
import { Subcontract } from '../../../../../Entities/subcontract';

@Component({
  selector: 'app-project-allocation',
  standalone: false,
  templateUrl: './project-allocation.component.html',
  styleUrl: './project-allocation.component.scss'
})
export class ProjectAllocationComponent implements OnInit, OnDestroy, OnChanges {

  private readonly subcontractsProjectUtils = inject(SubcontractProjectUtils);
  private readonly subcontractStateService = inject(SubcontractStateService);

  modalType: 'create' | 'delete' | 'edit' = 'create';
  public currentSubcontractProject!: SubcontractProject | undefined;
  public subcontractProjectList!: SubcontractProject[];
  private subscription!: Subscription;

  @Input() currentSubcontract!: Subcontract;

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  visibleModal: boolean = false;

  optionSelected: string = '';
  allocationsColumns: any[] = [];
  userAllocationsPreferences: UserPreference = {};
  tableKey: string = 'Allocations'
  dataKeys = ['projectLabel', 'share', 'amount'];
  subcontractId!: number;

  constructor(
    private readonly userPreferenceService: UserPreferenceService,
    private readonly translate: TranslateService,
    private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.subcontractId = params['subContractId'];
      this.loadSubcontractProjects();
    });

    this.loadColumns()
    this.userAllocationsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.allocationsColumns);
    this.loading = false;
    this.subscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumns();
      this.userAllocationsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.allocationsColumns);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['currentSubcontract'] && this.currentSubcontract){
      this.subcontractStateService.currentSubcontract$.subscribe((updatedSubcontract) => {
        if(updatedSubcontract && updatedSubcontract.netOrGross !== this.currentSubcontract.netOrGross){
          this.loadSubcontractProjects();
        }
      });
    }
  }

  loadColumns() {
    this.allocationsColumns = [
      { field: 'project.projectLabel', header: this.translate.instant(_('SUB-CONTRACTS.PROJECT.PROJECT')) },
      { field: 'share', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('SUB-CONTRACTS.PROJECT.SHARE')) },
      { field: 'amount', type: 'double',customClasses: ['align-right'], header: this.translate.instant(_('SUB-CONTRACTS.PROJECT.AMOUNT')) },
    ];
  }

  private loadSubcontractProjects(): void {
    this.subcontractsProjectUtils.getAllSubcontractsProject(this.subcontractId).subscribe(sc => {
      this.subcontractProjectList = sc
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onUserAllocationsPreferencesChanges(userAllocationsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userAllocationsPreferences));
  }

  closeModal() {
    this.visibleModal = false;
    this.optionSelected = '';
  }

  handleSubcontractProjectTableEvents(event: { type: 'create' | 'delete' | 'edit', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'edit') {
      this.optionSelected = "EDIT"
      this.currentSubcontractProject = event.data;
    }
    if (event.type === 'delete') {
      this.optionSelected = "DELETE";
      const tempSubcontractProject = this.subcontractProjectList.find((subcontractproject) => subcontractproject.id === Number(event.data));
      if (tempSubcontractProject) {
        this.currentSubcontractProject = tempSubcontractProject;
      }
    }
    if (event.type === 'create') {
      this.optionSelected = "NEW";
      this.currentSubcontractProject = undefined;
    }

    this.visibleModal = true;
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

  onSubcontractProjectDeleted(subContractProject: SubcontractProject) {
    this.subcontractProjectList = this.subcontractProjectList.filter( sp => sp.id !== subContractProject.id);
  }
}
