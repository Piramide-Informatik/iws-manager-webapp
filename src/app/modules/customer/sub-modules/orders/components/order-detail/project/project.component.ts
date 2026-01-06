import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectUtils } from '../../../../projects/utils/project.utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { momentCreateDate } from '../../../../../../shared/utils/moment-date-utils';
import { Project } from '../../../../../../../Entities/project';
import { Order } from '../../../../../../../Entities/order';

@Component({
  selector: 'app-project',
  standalone: false,
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit, OnDestroy, OnChanges {
  private readonly projectUtils = inject(ProjectUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly subscription = new Subscription();
  private readonly customerId: number = this.route.snapshot.params['id'];
  public readonly projects = toSignal(
    this.projectUtils.getAllProjectByCustomerId(this.customerId),
    { initialValue: [] }
  );

  @Input() orderToEdit!: Order;
  @Output() onCreateOrderProject = new EventEmitter<Project | null>();

  public projectForm!: FormGroup;
  private selectedProject: Project | null = null;

  ngOnInit(): void {
    this.initForm();
    if (!this.orderToEdit) {
      this.changeProjectSelected();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderToEdit'] && this.orderToEdit) {
      this.initForm();
      this.projectForm.patchValue({
        projectLabel: this.orderToEdit.project?.id,
        promoterNo: this.orderToEdit.project?.promoter?.promoterNo,
        promoter: this.orderToEdit.project?.promoter?.projectPromoter,
        startDate: momentCreateDate(this.orderToEdit.project?.startDate),
        endDate: momentCreateDate(this.orderToEdit.project?.endDate)
      });
      this.changeProjectSelected();
      this.loadProjectData();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm(): void {
    this.projectForm = new FormGroup({
      projectLabel: new FormControl(''),
      promoterNo: new FormControl(''),
      promoter: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
    });
    this.projectForm.get('promoterNo')?.disable();
    this.projectForm.get('promoter')?.disable();
    this.projectForm.get('startDate')?.disable();
    this.projectForm.get('endDate')?.disable();
  }

  private changeProjectSelected(): void {
    this.subscription.add(
      this.projectForm.get('projectLabel')?.valueChanges.subscribe((projectIdSelected: number | null) => {
        // reset form
        this.projectForm.reset({}, { emitEvent: false });

        this.selectedProject = this.projects().find(p => p.id === projectIdSelected) ?? null;
        if (projectIdSelected && this.selectedProject) {
          this.projectForm.get('promoterNo')?.setValue(this.selectedProject.promoter?.promoterNo, { emitEvent: false });
          this.projectForm.get('promoter')?.setValue(this.selectedProject.promoter?.projectPromoter, { emitEvent: false });
          this.projectForm.get('startDate')?.setValue(momentCreateDate(this.selectedProject.startDate), { emitEvent: false });
          this.projectForm.get('endDate')?.setValue(momentCreateDate(this.selectedProject.endDate), { emitEvent: false });
        } else {
          this.projectForm.reset({}, { emitEvent: false });
        }
      })
    );
  }

  private loadProjectData(): void {
    const currentPromoterNo = this.projectForm.get('promoterNo')?.value;
    const currentPromoter = this.projectForm.get('promoter')?.value;
    const currentStartDate = this.projectForm.get('startDate')?.value;
    const currentEndDate = this.projectForm.get('endDate')?.value;

    if (this.orderToEdit?.project?.id) {
      const fullProject = this.projects().find(p => p.id === this.orderToEdit.project?.id);

      if (fullProject) {
        this.selectedProject = fullProject;

        this.projectForm.patchValue({
          promoterNo: fullProject.promoter?.promoterNo || currentPromoterNo || '',
          promoter: fullProject.promoter?.projectPromoter || currentPromoter || '',
          startDate: momentCreateDate(fullProject.startDate) || currentStartDate,
          endDate: momentCreateDate(fullProject.endDate) || currentEndDate
        });
      } else {
        this.projectForm.patchValue({
          projectLabel: this.orderToEdit.project.id
        });
      }
    }
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return
    this.onCreateOrderProject.emit(this.selectedProject);
  }

  public clearOrderProjectForm(): void {
    this.projectForm.reset();
  }
}
