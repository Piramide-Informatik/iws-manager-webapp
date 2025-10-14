import { Component, computed, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Network } from '../../../../../../Entities/network';
import { CustomerUtils } from '../../../../../customer/utils/customer-utils';
import { ContactUtils } from '../../../../../customer/utils/contact-utils';
import { CustomerService } from '../../../../../../Services/customer.service';
import { ContactPersonService } from '../../../../../../Services/contact-person.service';
import { NetworkPartner } from '../../../../../../Entities/network-partner';
import { NetowrkPartnerUtils } from '../../utils/ network-partner.utils';
import { InputNumber } from 'primeng/inputnumber';
import { ContactPerson } from '../../../../../../Entities/contactPerson';

@Component({
  selector: 'app-network-partner-modal',
  standalone: false,
  templateUrl: './network-partner-modal.component.html',
  styleUrl: './network-partner-modal.component.scss'
})
export class NetworkPartnerModalComponent implements OnInit, OnChanges {
  private readonly networkPartnerUtils = inject(NetowrkPartnerUtils);
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
  @Output() deleteNetworkPartner = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @Output() cancelNetworkPartnerAction = new EventEmitter();
  @ViewChild('firstInput') firstInput!: InputNumber;
  public networkPartnerForm!: FormGroup;
  public isLoading = false;
  selectedCustomer = signal(0);
  selectedContact = signal(0);
  isCreateButtonEnable = false;

  readonly customers = computed(() => {
    return this.customerService.customers()
  });
  private readonly contactsMap = new Map<number, ContactPerson>();
  readonly contacts = computed(() => {
    return this.contactService.contactPersons().map(ct => {
      this.contactsMap.set(ct.id, ct);
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
      partnerno: new FormControl(null),
      comment: new FormControl(''),
      partner: new FormControl(''),
      contact: new FormControl(''),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      setTimeout(() => {
        this.focusInputIfNeeded();
      });
    }
    
    if (changes['visible'] && this.visible && this.modalType === 'create') {
      this.resetForm();
    } 
    let selectNetworkPartnerChange = changes['selectedNetworkPartner'];
    if (selectNetworkPartnerChange && !selectNetworkPartnerChange.firstChange) {
      this.selectedNetworkPartner = selectNetworkPartnerChange.currentValue;
      this.isCreateButtonEnable = this.selectedNetworkPartner !== null;
      this.networkPartnerForm.patchValue({
        partnerno: this.selectedNetworkPartner?.partnerno,
        comment: this.selectedNetworkPartner?.comment,
        partner: this.selectedNetworkPartner?.partner?.id,
        contact: this.selectedNetworkPartner?.contact?.id
      });
    }
  }

  onSubmit(): void {
    if(this.networkPartnerForm.invalid || this.isLoading || !this.network) return
    this.isLoading = true;
    const networkPartnerData = this.networkPartnerForm.value;
    if (!this.selectedNetworkPartner) {
      const newNetworkPartner: Omit<NetworkPartner, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
        partnerno: networkPartnerData.partnerno,
        comment: networkPartnerData.comment?.trim(),
        partner: this.customers().find(ct => ct.id == networkPartnerData.partner),
        contact: this.contactsMap.get(networkPartnerData.contact),
        network: this.network
      }
      this.networkPartnerUtils.createNewNetworkPartner(newNetworkPartner).subscribe({
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
      const editedNetworkPartner: NetworkPartner = {
        ...this.selectedNetworkPartner,
        partnerno: networkPartnerData.partnerno,
        comment: networkPartnerData.comment?.trim(),
        partner: this.customers().find(ct => ct.id == networkPartnerData.partner),
        contact: this.contactsMap.get(networkPartnerData.contact),
        network: this.network
      }
      this.networkPartnerUtils.updateNetworkPartner(editedNetworkPartner).subscribe({
        next: (edited) => {
          this.isLoading = false;
          this.closeModal();
          this.editNetworkPartner.emit({edited, status: 'success'});
        },
        error: (error) => {
          this.isLoading = false;
          console.log(error)
          this.editNetworkPartner.emit({ status: 'error' });
        }
      });
    }
  }

  closeModal() {
    this.resetForm();
    this.isVisibleModal.emit(false);
  }

  onDeleteNetworkPartnerConfirm() {
    this.isLoading = true;
    if (this.selectedNetworkPartner) {
      this.networkPartnerUtils.deleteNetworkPartener(this.selectedNetworkPartner.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteNetworkPartner.emit({status: 'success'});
        },
        error: (error) => {
          this.isLoading = false;
          this.deleteNetworkPartner.emit({ status: 'error', error: error });
        }
      })
    }
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  private focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.input.nativeElement) {
          this.firstInput.input.nativeElement.focus();
        }
      }, 200);
    }
  }

  private resetForm(): void {
    this.networkPartnerForm.reset();
    this.selectedCustomer.set(0);
    this.selectedContact.set(0);
    this.networkPartnerForm.markAsPristine();
    this.networkPartnerForm.markAsUntouched();
  }
}