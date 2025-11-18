import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactPerson } from '../../../../Entities/contactPerson';
import { Salutation } from '../../../../Entities/salutation';
import { SalutationService } from '../../../../Services/salutation.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '../../../../Entities/title';
import { TitleService } from '../../../../Services/title.service';
import { finalize, Subscription, switchMap } from 'rxjs';
import { ContactUtils } from '../../utils/contact-utils';
import { Customer } from '../../../../Entities/customer';
import { ContactStateService } from '../../utils/contact-state.service';
import { CustomerStateService } from '../../utils/customer-state.service';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit, OnDestroy, OnChanges {
  // Dependencies injection
  private readonly contactUtils = inject(ContactUtils);
  private readonly customerStateService = inject(CustomerStateService);
  private readonly contactStateService = inject(ContactStateService);
  private readonly salutationService = inject(SalutationService);
  private readonly titleService = inject(TitleService);

  // Iputs & Outputs
  @Input() modalType: 'create' | 'delete' | 'edit' = 'create';
  @Input() currentContact!: ContactPerson | null;
  @Input() visible = false;
  @Input() closeModal = false;
  @Output() onVisibility = new EventEmitter<boolean>();
  @Output() onOperationContact = new EventEmitter<number>();

  // Signals & states
  private readonly subscriptions = new Subscription();
  private currentCustomer!: Customer;
  public contacts = toSignal(this.salutationService.getAllSalutations(), { initialValue: [] });
  public titles = toSignal(this.titleService.getAllTitles(), { initialValue: [] });
  public showOCCErrorModal = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  // Form configuration
  public contactForm!: FormGroup;
  public selectedSalutation!: Salutation | undefined;
  public selectedTitle!: Title | undefined;

  isSaving = false;
  isLoading = false;
  errorMessage: string | null = null;
  visibleDeleteContactPersonEntity = false;

  constructor(
    private readonly commonMessageService: CommonMessagesService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.subscriptions.add(
      this.customerStateService.currentCustomer$.subscribe(customer => {
        if (customer) {
          this.currentCustomer = customer;
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modalType'] && (this.modalType === 'edit' || this.modalType === 'delete')) {
      this.setupContactPersonSubscription();
    }

    if(changes['closeModal'] && this.contactForm){
      this.handleClose();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initForm(): void {
    this.contactForm = new FormGroup({
      lastName: new FormControl('', [Validators.minLength(2), Validators.required]),
      firstName: new FormControl(''),
      salutation: new FormControl(this.selectedSalutation),
      title: new FormControl(this.selectedTitle),
      function: new FormControl(''),
      emailAddress: new FormControl(''),
      isInvoiceRecipient: new FormControl(false),
    });
  }

  onSubmit(): void {
    if (this.modalType === 'create') {
      this.handleCreateContact();
    } else if (this.modalType === 'delete') {
      this.deleteConfirm();
    } else if (this.modalType === 'edit') {
      this.handleEditContact();
    }
  }

  private handleCreateContact(): void {
    if (this.shouldPreventSubmission()) return;

    this.isSaving = true;
    const newContact = this.getContactFormValues();

    const createSub = this.contactUtils.createNewContactPerson(newContact).subscribe({
      next: () => {
        this.isSaving = false;
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.onOperationContact.emit(this.currentCustomer.id);
        this.handleClose();
      },
      error: (err) => {
        console.log(err)
        this.isSaving = false;
        this.commonMessageService.showErrorCreatedMessage();
      }
    });

    this.subscriptions.add(createSub);
  }

  private handleEditContact(): void {
    if (this.shouldPreventSubmission() || !this.currentContact) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updatedContact: ContactPerson = {
      ...this.currentContact,
      lastName: this.contactForm.value.lastName,
      firstName: this.contactForm.value.firstName,
      salutation: this.contactForm.value.salutation,
      title: this.contactForm.value.title,
      function: this.contactForm.value.function,
      forInvoicing: this.contactForm.value.isInvoiceRecipient ? 1 : 0,
      email: this.contactForm.value.emailAddress,
    };


    const updateSub = this.contactUtils.updateContactPerson(updatedContact).pipe(
      switchMap(() => this.contactUtils.refreshContactsPersons()),
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: () => {
        this.commonMessageService.showEditSucessfullMessage();
        this.onOperationContact.emit(this.currentCustomer.id);
        this.handleClose();
      },
      error: (err) => this.handleSaveError(err)
    });

    this.subscriptions.add(updateSub);
  }

  private handleSaveError(error: any): void {
    this.isSaving = false;

    if (error instanceof OccError) {
      this.showOCCErrorModal = true;
      this.occErrorType = error.errorType;
    }
    this.commonMessageService.showErrorEditMessage();
  }

  private shouldPreventSubmission(): boolean {
    return this.contactForm.invalid || this.isLoading || this.isSaving;
  }

  private getContactFormValues(): Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
    return {
      lastName: this.contactForm.value.lastName?.trim() ?? '',
      firstName: this.contactForm.value.firstName?.trim() ?? '',
      salutation: this.contactForm.value.salutation,
      title: this.contactForm.value.title,
      function: this.contactForm.value.function?.trim() ?? '',
      forInvoicing: this.contactForm.value.isInvoiceRecipient ? 1 : 0,
      email: this.contactForm.value.emailAddress?.trim() ?? '',
      customer: this.currentCustomer
    };
  }

  handleClose(): void {
    this.errorMessage = null;
    this.onVisibility.emit(false);
    this.contactForm.markAsUntouched();
    this.contactForm.markAsPristine();
    this.contactForm.reset();
    this.visibleDeleteContactPersonEntity = false;
  }

  deleteConfirm() {
    this.isLoading = true;
    if (this.currentContact) {
      this.contactUtils.deleteContactPerson(this.currentContact.id).pipe(
        switchMap(() => this.contactUtils.refreshContactsPersons())
      ).subscribe({
        next: () => {
          this.isLoading = false;
          this.onOperationContact.emit(this.currentCustomer.id);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.handleClose();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message ?? 'Failed to delete contact person';
          console.error('Delete error:', error);
          this.handleDeleteError(error);
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }

  handleDeleteError(error: any) {
    if (error instanceof OccError || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED') {
      this.showOCCErrorModal = true;
      this.occErrorType = 'DELETE_UNEXISTED';
      this.visibleDeleteContactPersonEntity = false;
    }
  }

  onDeleteContactPersonEntity() {
    this.visibleDeleteContactPersonEntity = true;
  }

  deleteContactPersonConfirm() {
    this.deleteConfirm();
  }

  private setupContactPersonSubscription(): void {
    this.subscriptions.add(
      this.contactStateService.currentContact$.subscribe(contact => {
        this.currentContact = contact;
        if (contact && this.modalType === 'edit') {
          this.loadContactPersonDataForm(contact);
        } else if (!contact) {
          this.clearForm();
        }
      })
    );
  }

  private loadContactPersonDataForm(contact: ContactPerson): void {
    this.contactForm.patchValue({
      lastName: contact.lastName,
      firstName: contact.firstName,
      salutation: contact.salutation,
      title: contact.title,
      function: contact.function,
      emailAddress: contact.email,
      isInvoiceRecipient: !!contact.forInvoicing
    });
  }

  private clearForm(): void {
    this.contactForm.reset();
    this.currentContact = null;
    this.isSaving = false;
  }

  private markAllAsTouched(): void {
    for(const control of Object.values(this.contactForm.controls)){
      control.markAsTouched();
      control.markAsDirty();
    }
  }
}

