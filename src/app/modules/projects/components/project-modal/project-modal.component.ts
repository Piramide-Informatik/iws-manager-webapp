import { Component, effect, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, Signal, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectUtils } from '../../../customer/sub-modules/projects/utils/project.utils';
import { Project } from '../../../../Entities/project';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { FundingProgramUtils } from '../../../master-data/components/funding-programs/utils/funding-program-utils';
import { PromoterUtils } from '../../../master-data/components/project-funnels/utils/promoter-utils';
import { Customer } from '../../../../Entities/customer';
import { FundingProgram } from '../../../../Entities/fundingProgram';
import { Promoter } from '../../../../Entities/promoter';
import { momentFormatDate } from '../../../shared/utils/moment-date-utils';
import { OrderUtils } from '../../../customer/sub-modules/orders/utils/order-utils';
import { Order } from '../../../../Entities/order';
import { Subscription, take } from 'rxjs';
import { CommonMessagesService } from '../../../../Services/common-messages.service';

@Component({
  selector: 'app-project-modal',
  standalone: false,
  templateUrl: './project-modal.component.html',
  styleUrl: './project-modal.component.scss'
})
export class ProjectModalComponent implements OnInit, OnChanges, OnDestroy {
  private readonly projectUtils = inject(ProjectUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
  private readonly promoterUtils = inject(PromoterUtils);
  private readonly orderUtils = inject(OrderUtils);
  private readonly subscriptions = new Subscription();
  private readonly commonMessageService = inject(CommonMessagesService);

  public isLoading = false;
  public formNewProject!: FormGroup;
  public nameAlreadyExist = false;

  @Input() visible = false;
  @Output() visibleModal = new EventEmitter<void>();
  @Output() createProject = new EventEmitter<{created?: Project, error?: any}>();
  @ViewChild('firstInput') firstInput!: ElementRef;

  // Maps
  private readonly customersMap = new Map<number, Customer>();
  private readonly fundingsMap = new Map<number, FundingProgram>();
  private readonly promotersMap = new Map<number, Promoter>();
  private readonly ordersMap = new Map<number, Order>();

  // Signals
  public customers = toSignal(this.customerUtils.getAllCustomers(), { initialValue: [] });
  public fundingPrograms = toSignal(this.fundingProgramUtils.getAllFundingPrograms(), { initialValue: [] });
  public promoters = toSignal(this.promoterUtils.getAllPromotersSortedByPromoterNo(), { initialValue: [] });
  public orders = toSignal(this.orderUtils.getAllOrdersSortedByOrderLabel(), { initialValue: [] });

  constructor() {
    this.createMapEffect(this.customers, this.customersMap);
    this.createMapEffect(this.fundingPrograms, this.fundingsMap);
    this.createMapEffect(this.promoters, this.promotersMap);
    this.createMapEffect(this.orders, this.ordersMap);
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      this.firstInputFocus();
    }
    if(changes['visible'] && !this.visible && this.formNewProject){
      this.formNewProject.reset();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initForm(): void {
    this.formNewProject = new FormGroup({
      projectLabel: new FormControl(''),
      projectName: new FormControl('', [Validators.required]),
      customer: new FormControl(),
      orderFueLabel: new FormControl(),
      orderFueNo: new FormControl({value: null, disabled: true}),
      fundingProgram: new FormControl(),
      promoterNo: new FormControl(),
      projectPromoter: new FormControl({value: '', disabled: true}),
      fundingLabel: new FormControl(),
      authorizationDate: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      fundingRate: new FormControl(null),
      stuffFlat: new FormControl(null),
      shareResearch: new FormControl(null),
      hourlyRateMueu: new FormControl(null),
      productiveHoursPerYear: new FormControl(null),
      orderLabelAdmin: new FormControl(''),
      orderNoAdmin: new FormControl({value: null, disabled: true})
    });

    this.subscriptions.add(
      this.formNewProject.get('orderFueLabel')?.valueChanges.subscribe((idOrder: number | null) => {
        if(idOrder){
          const orderNo = this.ordersMap.get(idOrder)?.orderNo;
          this.formNewProject.get('orderFueNo')?.setValue(orderNo, { emitEvent: false });
        }else{
          this.formNewProject.get('orderFueNo')?.setValue(null , { emitEvent: false });
        }
      })
    );

    this.subscriptions.add(
      this.formNewProject.get('promoterNo')?.valueChanges
      .subscribe((idPromoter: number | null) => {
        if(idPromoter){
          const projectPromoter = this.promotersMap.get(idPromoter)?.projectPromoter;
          this.formNewProject.get('projectPromoter')?.setValue(projectPromoter, { emitEvent: false });
        }else{
          this.formNewProject.get('projectPromoter')?.setValue(null, { emitEvent: false });
        }
      })
    );

    this.subscriptions.add(
      this.formNewProject.get('orderLabelAdmin')?.valueChanges
      .subscribe((idOrder: number | null) => {
        if(idOrder){
          const orderNo = this.ordersMap.get(idOrder)?.orderNo;
          this.formNewProject.get('orderNoAdmin')?.setValue(orderNo, { emitEvent: false });
        }else{
          this.formNewProject.get('orderNoAdmin')?.setValue(null, { emitEvent: false });
        }
      })
    );
  }

  onSubmit(): void {
    this.isLoading = true;
    const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'version'> = this.getDataFromForm();

    this.projectUtils.createProject(newProject).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createProject.emit({created});
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message.includes('name already exists')){
          this.nameAlreadyExist = true;
          this.formNewProject.get('projectName')?.valueChanges.pipe(take(1))
            .subscribe(() => this.nameAlreadyExist = false);
          this.commonMessageService.showErrorCreatedMessage();
        }else {
          this.closeModal();
          this.createProject.emit({error});
        }
      }
    });
  }

  closeModal(): void {
    this.visibleModal.emit();
  }

  private firstInputFocus(): void {
    if(this.firstInput && this.formNewProject){
      setTimeout(()=>{
        if(this.firstInput.nativeElement){
          this.firstInput.nativeElement.focus()
        }
      },200)
    }
  }

  getCustomerById(id: number): Customer | undefined {
    return this.customersMap.get(id);
  }

  getFundingProgramById(id: number): FundingProgram | undefined {
    return this.fundingsMap.get(id);
  }

  getPromoterById(id: number): Promoter | undefined {
    return this.promotersMap.get(id);
  }

  getOrderById(id: number): Order | undefined {
    return this.ordersMap.get(id);
  }

  private getDataFromForm(): Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
    return {
      projectLabel: this.formNewProject.get('projectLabel')!.value,
      projectName: this.formNewProject.get('projectName')!.value,
      customer: this.getCustomerById(this.formNewProject.get('customer')!.value) ?? null,
      orderFue: this.getOrderById(this.formNewProject.get('orderFueLabel')!.value) ?? null,
      fundingProgram: this.getFundingProgramById(this.formNewProject.get('fundingProgram')!.value) ?? null,
      promoter: this.getPromoterById(this.formNewProject.get('promoterNo')!.value) ?? null,
      fundingLabel: this.formNewProject.get('fundingLabel')!.value,
      authorizationDate: momentFormatDate(this.formNewProject.get('authorizationDate')!.value),
      startDate: momentFormatDate(this.formNewProject.get('startDate')!.value),
      endDate: momentFormatDate(this.formNewProject.get('endDate')!.value),
      fundingRate: this.formNewProject.get('fundingRate')!.value,
      stuffFlat: this.formNewProject.get('stuffFlat')!.value,
      shareResearch: this.formNewProject.get('shareResearch')!.value,
      hourlyRateMueu: this.formNewProject.get('hourlyRateMueu')!.value,
      productiveHoursPerYear: this.formNewProject.get('productiveHoursPerYear')!.value,
      orderAdmin: this.getOrderById(this.formNewProject.get('orderLabelAdmin')!.value) ?? null,
      empiws20: null,
      empiws30: null,
      empiws50: null,
      network: null,
      status: null,
      approvalDate: undefined,
      chance: undefined,
      comment: undefined,
      date1: undefined,
      date2: undefined,
      date3: undefined,
      date4: undefined,
      date5: undefined,
      datelevel1: undefined,
      datelevel2: undefined,
      donation: undefined,
      endApproval: undefined,
      financeAuthority: undefined,
      income1: undefined,
      income2: undefined,
      income3: undefined,
      income4: undefined,
      income5: undefined,
      maxHoursPerMonth: undefined,
      maxHoursPerYear: undefined,
      note: undefined,
      startApproval: undefined,
      title: undefined
    }
  }

  private createMapEffect<T extends { id: number }>( signal: Signal<T[]>, map: Map<number, T>): void {
    effect(() => {
      const items = signal();
      map.clear();
      for (const item of items) {
        map.set(item.id, item);
      }
    });
  }
}
