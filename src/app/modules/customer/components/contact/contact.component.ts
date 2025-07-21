import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactPerson } from '../../../../Entities/contactPerson';
import { Salutation } from '../../../../Entities/salutation';
import { SalutationService } from '../../../../Services/salutation.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '../../../employee/models/title';
import { TitleService } from '../../../../Services/title.service';
import { finalize, of, Subscription, switchMap } from 'rxjs';
import { ContactUtils } from '../../utils/contact-utils';
import { Customer } from '../../../../Entities/customer';
import { ContactStateService } from '../../utils/contact-state.service';
import { CustomerStateService } from '../../utils/customer-state.service';
import { CommonMessagesService } from '../../../../Services/common-messages.service';

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
  @Output() onVisibility = new EventEmitter<boolean>();
  @Output() onOperationContact = new EventEmitter<number>();

  // Signals & states
  private readonly subscriptions = new Subscription();
  private currentCustomer!: Customer;
  public contacts = toSignal(this.salutationService.getAllSalutations(), { initialValue: [] });
  public titles = toSignal(this.titleService.getAllTitles(), { initialValue: [] });
  public showOCCErrorModal = false;

  // Form configuration
  public contactForm!: FormGroup;
  public selectedSalutation!: Salutation | undefined;
  public selectedTitle!: Title | undefined;

  isSaving = false;
  isLoading = false;
  errorMessage: string | null = null;

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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initForm(): void {
    this.contactForm = new FormGroup({
      lastName: new FormControl('', [Validators.required]),
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

    this.prepareForSubmission();
    const newContact = this.getContactFormValues();

    const createSub = this.contactUtils.createNewContactPerson(newContact).subscribe({
      next: () => {
        this.commonMessageService.showSuccessMessage('MESSAGE.CREATE_SUCCESS');
        this.onOperationContact.emit(this.currentCustomer.id);
        this.handleClose();
      },
      error: (err) => {
        this.commonMessageService.showErrorCreatedMessage();
        this.handleError('MESSAGE.CREATE_FAILED', err);
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
    console.error('Error saving contact:', error);
    this.isSaving = false; // Asegurar que se resetee

    if (error instanceof Error && error.message?.includes('version mismatch')) {
      this.showOCCErrorModal = true;
      return;
    }
    
    this.commonMessageService.showErrorEditMessage();
  }

  private shouldPreventSubmission(): boolean {
    return this.contactForm.invalid || this.isLoading || this.isSaving;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    this.commonMessageService.showErrorMessage(this.errorMessage);
    console.error('Error:', error);
    return of(null);
  }

  private getContactFormValues(): Omit<ContactPerson, 'id'> {
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
    this.isLoading = false;
    this.isSaving = false;
    this.errorMessage = null;
    this.onVisibility.emit(false);
    this.contactForm.reset();
    this.contactForm.markAsUntouched();
    this.contactForm.markAsPristine();
  }

  deleteConfirm() {
    this.isLoading = true;
    if (this.currentContact) {
      this.contactUtils.deleteContactPerson(this.currentContact.id).pipe(
        switchMap(() => this.contactUtils.refreshContactsPersons()),
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.onOperationContact.emit(this.currentCustomer.id);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.handleClose();
        },
        error: (error) => {
          this.errorMessage = error.message ?? 'Failed to delete contact person';
          console.error('Delete error:', error);
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
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
    Object.values(this.contactForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }
}

