import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

import { TranslateService, _, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { ProjectUtils } from '../../utils/project.utils';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Column } from '../../../../../../Entities/column';
import { CustomerUtils } from '../../../../../customer/utils/customer-utils';
import { Title } from '@angular/platform-browser';
import { CustomerStateService } from '../../../../../customer/utils/customer-state.service';

@Component({
  selector: 'app-projects-overview',
  standalone: false,
  providers: [MessageService, ConfirmationService, TranslatePipe, TranslateDirective],
  templateUrl: './projects-overview.component.html',
  styleUrl: './projects-overview.component.scss'
})
export class ProjectsOverviewComponent implements OnInit, OnDestroy {

  private readonly projectUtils = inject(ProjectUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly titleService = inject(Title);
  private readonly customerStateService = inject(CustomerStateService);

  filterIndex = 5;

  public cols!: Column[];

  public selectedColumns!: Column[];

  public selectedFilterColumns!: Column[];

  public projects!: any[];

  public customer!: number;

  private langSubscription!: Subscription;

  @ViewChild('dt2') dt2!: Table;

  userProjectPreferences: UserPreference = {};

  tableKey: string = 'Projects'

  dataKeys = ['projectLabel', 'projectName', 'fundingProgram', 'promoter', 'fundingLabel', 'startDate', 'endDate', 'authDate', 'fundingRate'];

  visibleProjectModal = false;

  isProjectLoading = false;

  selectedProject!: any;

  constructor(

    private readonly activatedRoute: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly commonMessage: CommonMessagesService
  ) {
  }

  ngOnInit(): void {
    this.loadProjectColHeaders();
    this.selectedColumns = this.cols;
    this.userProjectPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadProjectColHeaders();
      this.selectedColumns = this.cols;
      this.userProjectPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.activatedRoute.params.subscribe(params => {
      const customerId = params['id'];

      if (!customerId) {
        this.projects = [];
        this.updateTitle('...');
        return;
      }

      this.customerStateService.currentCustomer$.pipe(take(1)).subscribe(currentCustomer => {
        if (currentCustomer) {
          this.customer = currentCustomer.id;
          this.updateTitle(currentCustomer.customername1!);
          this.loadProjects(this.customer);
        } else {
          this.customerUtils.getCustomerById(customerId).subscribe(customer => {
            if (customer) {
              this.customer = customer.id;
              this.updateTitle(customer.customername1!);
              this.loadProjects(this.customer);
            } else {
              this.projects = [];
              this.updateTitle('');
            }
          });
        }
      });
    });
  }

  private loadProjects(customerId: number): void {
    this.projectUtils.getAllProjectByCustomerId(customerId).subscribe(projects => {
      this.projects = projects.reduce((acc: any[], curr) => {
        acc.push({
          id: curr.id,
          projectLabel: curr.projectLabel,
          projectName: curr.projectName,
          fundingProgram: curr.fundingProgram?.name ?? '',
          promoter: curr.promoter?.projectPromoter ?? '',
          fundingLabel: curr.fundingLabel,
          startDate: curr.startDate,
          endDate: curr.endDate,
          authDate: curr.approvalDate,
          fundingRate: curr.fundingRate
        });
        return acc;
      }, []);
    });
  }


  openDeleteModal(id: any) {
    this.visibleProjectModal = true;
    const project = this.projects.find(project => project.id == id);
    if (project) {
      this.selectedProject = project;
    }
  }

  onProjectDelete() {
    if (this.selectedProject) {
      this.isProjectLoading = true;
      this.projectUtils.deleteProject(this.selectedProject.id).subscribe({
        next: () => {
          this.commonMessage.showDeleteSucessfullMessage();
          this.projects = this.projects.filter(project => project.id != this.selectedProject.id);
        },
        error: (errorDelete) => {
          this.isProjectLoading = false;
          if (errorDelete.message.includes('have associated receivables')
            || errorDelete.message.includes('have associated orders')) {
            this.commonMessage.showErrorDeleteMessageContainsOtherEntities();
          } else {
            this.commonMessage.showErrorDeleteMessage();
          }
          this.visibleProjectModal = false;
          this.selectedProject = undefined;
        },
        complete: () => {
          this.visibleProjectModal = false;
          this.selectedProject = undefined;
          this.isProjectLoading = false;
        }
      })
    }
  }


  onUserProjectPreferencesChanges(userProjectPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectPreferences));
  }

  loadProjectColHeaders(): void {
    this.cols = [];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(`${this.translate.instant('PAGETITLE.CUSTOMER')} ${name} ${this.translate.instant('PAGETITLE.CUSTOMERS.PROJECTS')}`);
  }

}
