import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { TranslateService, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Table } from 'primeng/table';
import { Project } from '../../../../Entities/project';
import { ProjectService } from '../../services/project.service';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-projects-overview',
  standalone: false,
  providers: [MessageService, ConfirmationService, Project, TranslatePipe, TranslateDirective],
  templateUrl: './projects-overview.component.html',
  styleUrl: './projects-overview.component.scss'
})
export class ProjectsOverviewComponent implements OnInit {

  filterIndex = 5;

  public cols!: Column[];

  public selectedColumns!: Column[];

  public filterCols!: Column[];

  public selectedFilterColumns!: Column[];

  public projects!: Project[];
  
  public customer!: string;

  private langSubscription!: Subscription;

  @ViewChild('dt2') dt2!: Table;

  constructor(
  
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.selectedColumns = this.cols;
    this.selectedFilterColumns = this.filterCols;

    this.customer = 'Valentin Laime';

    this.projects = this.projectService.list();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {

    });

    //Init colums
    this.cols = [
      { field: 'projectLabel', header: 'Projekt' },
      { field: 'projectName', header: 'Langname' },
      { field: 'fundingProgram', header: 'Förd.Programm' },
      { field: 'promoter', header: 'Projektträger' },
      { field: 'fundingLabel', header: 'Förderkennzeichen' },
      { field: 'startDate', header: 'Start' },
      { field: 'endDate', header: 'Ende' },
      { field: 'authDate', header: 'Förderkennzeichen' },
      { field: 'fundingRate', header: 'Fördersatz' }

    ];

    //Filter colums
    this.filterCols = [
      { field: 'projectLabel', header: 'Projekt' },
      { field: 'projectName', header: 'Langname' },
      { field: 'fundingProgram', header: 'Förd.Programm' },
      { field: 'promoter', header: 'Projektträger' },
      { field: 'fundingLabel', header: 'Förderkennzeichen' }
    ];

    this.selectedColumns = this.cols;
    this.selectedFilterColumns = this.filterCols;
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

}
