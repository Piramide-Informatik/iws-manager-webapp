import { Component, computed, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Network } from '../../../../../../Entities/network';
import { CustomerUtils } from '../../../../../customer/utils/customer-utils';
import { ContactUtils } from '../../../../../customer/utils/contact-utils';
import { CustomerService } from '../../../../../../Services/customer.service';
import { ContactPersonService } from '../../../../../../Services/contact-person.service';
import { NetworkPartner } from '../../../../../../Entities/network-partner';
import { NetowrkPartnerUtils } from '../../utils/ network-partner.utils';

@Component({
  selector: 'app-network-partner-modal',
  standalone: false,
  templateUrl: './network-partner-modal.component.html',
  styleUrl: './network-partner-modal.component.scss'
})
export class NetworkPartnerModalComponent implements OnInit, OnChanges {
  private readonly networPartnerUtils = inject(NetowrkPartnerUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly contactUtils = inject(ContactUtils);
  private readonly customerService = inject(CustomerService);
  private readonly contactService = inject(ContactPersonService);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'edit' | 'delete' = 'create';
  @Input() selectedNetworkPartner!: NetworkPartner | null;
  @Input() network: Network | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createNetworkPartner = new EventEmitter<{created?: Network, status: 'success' | 'error'}>();
  @Output() editNetworkPartner = new EventEmitter<{edited?: Network, status: 'success' | 'error'}>();
  @Output() deleteNetwork = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @Output() cancelNetworkPartnerAction = new EventEmitter();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public networkPartnerForm!: FormGroup;
  public isLoading = false;
  selectedCustomer = signal(0);
  selectedContact = signal(0);
  isCreateButtonEnable = false;

  public partners!: any[];
  public columsHeaderFieldPartner: any[] = [];
  readonly customers = computed(() => {
    return this.customerService.customers()
  });
  readonly contacts = computed(() => {
    return this.contactService.contactPersons().map(ct => {
      return {
        id: ct.id,
        name: `${ct.lastName} ${ct.firstName}`
      }
    })
  });

  constructor(){}

  ngOnInit(): void {
    this.customerUtils.loadInitialData().subscribe();
    this.contactUtils.loadInitialData().subscribe();
    this.networkPartnerForm = new FormGroup({
      partnerno: new FormControl(''),
      comment: new FormControl(''),
      partner: new FormControl(''),
      contactperson: new FormControl(''),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      this.focusInputIfNeeded();
    }
    let selectNetworkPartnerChange = changes['selectedNetworkPartner'];
    if (selectNetworkPartnerChange && !selectNetworkPartnerChange.firstChange) {
      this.selectedNetworkPartner = selectNetworkPartnerChange.currentValue;
      this.isCreateButtonEnable = this.selectedNetworkPartner !== null;
      this.networkPartnerForm.patchValue({
        partnerno: this.selectedNetworkPartner?.partnerno,
        comment: this.selectedNetworkPartner?.comment,
        partner: this.selectedNetworkPartner?.partner?.id,
        contactperson: this.selectedNetworkPartner?.contactperson?.id
      });
    }
  }

  onSubmit(): void {
    if(this.networkPartnerForm.invalid || this.isLoading) return
    this.isLoading = true;
    const networkPartnerData = this.networkPartnerForm.value;
    networkPartnerData.network = this.network;
    networkPartnerData.partner = this.customers().find(ct => ct.id == networkPartnerData.partner);
    networkPartnerData.contactperson = this.contactService.contactPersons().find( cp => cp.id == networkPartnerData.contactperson);
    if (!this.selectedNetworkPartner) {
      this.networPartnerUtils.createNewNetworkPartner(networkPartnerData).subscribe({
        next: (created) => {
          this.isLoading = false;
          this.closeModal();
          this.createNetworkPartner.emit({created, status: 'success'});
        },
        error: () => {
          this.isLoading = false;
          this.createNetworkPartner.emit({ status: 'error' });
        } 
      })
    } else {
      networkPartnerData.id = this.selectedNetworkPartner.id;
      networkPartnerData.createdAt = this.selectedNetworkPartner.createdAt;
      networkPartnerData.updatedAt = this.selectedNetworkPartner.updatedAt;
      networkPartnerData.version = this.selectedNetworkPartner.version;
      this.networPartnerUtils.updateNetworkPartner(networkPartnerData).subscribe({
        next: (edited) => {
          this.isLoading = false;
          this.closeModal();
          this.editNetworkPartner.emit({edited, status: 'success'});
        },
        error: (error) => {
          console.log(error)
          this.editNetworkPartner.emit({ status: 'error' });
        }
      });
    }
  }

  closeModal() {
    this.networkPartnerForm.reset();
    this.isVisibleModal.emit(false);
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  private focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
