import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactPerson } from '../../../../Entities/contactPerson';
import { Salutation } from '../../../../Entities/salutation';
import { SalutationService } from '../../../../Services/salutation.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '../../../employee/models/title';
import { TitleService } from '../../../../Services/title.service';
import { catchError, finalize, of, Subscription, switchMap } from 'rxjs';
import { ContactUtils } from '../../utils/contact-utils';
import { Customer } from '../../../../Entities/customer';
import { ContactStateService } from '../../utils/contact-state.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { CustomerStateService } from '../../utils/customer-state.service';

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

  // Form configuration
  public contactForm!: FormGroup;
  public selectedSalutation!: Salutation | undefined;
  public selectedTitle!: Title | undefined;

  isSaving = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
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
    if (changes['modalType'] && this.modalType === 'edit') {
      if (this.currentContact) this.setupContactPersonSubscription()
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
    const { firstName, lastName } = this.getContactFormValues();
    const newContact = this.getContactFormValues();

    this.contactUtils.contactPersonExists(firstName + ' ' + lastName).pipe(
      switchMap(exists => this.handleContactExistence(exists, newContact)),
      switchMap(() => this.contactUtils.refreshContactsPersons()),
      catchError(err => this.handleError('COUNTRY.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (result) => {
        if (result !== null) {
          this.showSuccessMessage('CONTACT.MESSAGE.CREATE_SUCCESS');
          this.onOperationContact.emit(this.currentCustomer.id);
          this.handleClose();
        }
      },
      error: (err) => {
        this.handleError('COUNTRY.ERROR.CREATION_FAILED', err);
      }
    });
  }

  private handleEditContact(): void {
    if (this.contactForm.invalid || !this.currentContact || this.isSaving) {
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
      forInvoicing: this.contactForm.value.isInvoiceRecipient ? 1 : 0
    };

    console.log("reload contacts for update")

    this.contactUtils.updateContactPerson(updatedContact).pipe(
      switchMap(() => this.contactUtils.refreshContactsPersons()),
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: () => {
        this.showSuccessMessage('CONTACT.MESSAGE.UPDATE_SUCCESS');
        this.onOperationContact.emit(this.currentCustomer.id);
        this.handleClose();
      },
      error: (err) => this.handleSaveError(err)
    });
  }

  private showSuccessMessage(messageKey: string): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('CONTACT.MESSAGE.SUCCESS'),
      detail: this.translate.instant(messageKey)
    });
  }

  private handleSaveError(error: any): void {
    console.error('Error saving contact:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('COUNTRIES.MESSAGE.ERROR'),
      detail: this.translate.instant('COUNTRIES.MESSAGE.UPDATE_FAILED')
    });
    this.isSaving = false;
  }

  private handleContactExistence(exists: boolean, newContact: Omit<ContactPerson, 'id'>) {
    if (exists) {
      this.errorMessage = 'COUNTRY.ERROR.ALREADY_EXISTS';
      return of(null);
    }
    return this.contactUtils.createNewContactPerson(newContact).pipe(
      catchError(err => this.handleError('COUNTRY.ERROR.CREATION_FAILED', err))
    );
  }

  private shouldPreventSubmission(): boolean {
    return this.contactForm.invalid ?? this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
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
      customer: this.currentCustomer
    };
  }

  handleClose(): void {
    this.isLoading = false;
    this.onVisibility.emit(false);
    this.contactForm.reset();
  }

  deleteConfirm() {
    this.isLoading = true;
    if (this.currentContact) {
      this.contactUtils.deleteContactPerson(this.currentContact.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.onOperationContact.emit(this.currentCustomer.id);
          this.handleClose();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message ?? 'Failed to delete contact person';
          console.error('Delete error:', error);
        }
      });
    }
  }

  private setupContactPersonSubscription(): void {
    this.subscriptions.add(
      this.contactStateService.currentContact$.subscribe(contact => {
        this.currentContact = contact;
        contact ? this.loadContactPersonDataForm(contact) : this.clearForm();
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
      emailAddress: '',
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

