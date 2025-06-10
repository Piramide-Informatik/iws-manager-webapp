import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactPerson } from '../../../../Entities/contactPerson';
import { Salutation } from '../../../../Entities/salutation';
import { SalutationService } from '../../../../Services/salutation.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '../../../employee/models/title';
import { TitleService } from '../../../../Services/title.service';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { ContactUtils } from '../../utils/contact-utils';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  private readonly contactUtils = inject(ContactUtils);
  currentContactPerson: ContactPerson | null = null;
  contactForm!: FormGroup;
  isSaving = false;
  @Output() onVisibility = new EventEmitter<boolean>();

  public selectedSalutation!: Salutation | undefined;
  private readonly salutationService = inject(SalutationService);
  contacts = toSignal(this.salutationService.getAllSalutations(), { initialValue: [] });

  public selectedTitle!: Title | undefined;
  private readonly titleService = inject(TitleService);
  titles = toSignal(this.titleService.getAllTitles(), { initialValue: [] })

  isLoading = false;
  errorMessage: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.contactForm = new FormGroup({
      lastName: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      salutation: new FormControl(this.selectedSalutation, [Validators.required]),
      title: new FormControl(this.selectedTitle, [Validators.required]),
      function: new FormControl('', [Validators.required]),
      emailAddress: new FormControl('', [Validators.required]),
      isInvoiceRecipient: new FormControl(false),
    });
  }

  closeModalForm(){
    this.contactForm.reset();
    this.onVisibility.emit(false);
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const { firstName  } = this.getContactFormValues();
    const newContact = this.getContactFormValues();
    this.contactUtils.contactPersonExists(firstName).pipe(
      switchMap(exists => this.handleCountryExistence(exists, newContact)),
      catchError(err => this.handleError('COUNTRY.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.isLoading = false)
    ).subscribe(result => {
      if (result !== null) {
        this.handleClose();
      }
    });
  }
  private handleCountryExistence(
    exists: boolean,
    newContact: Omit<ContactPerson, 'id'>
  ) {
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
  private getContactFormValues() {
    return {
      lastName: this.contactForm.value.lastName?.trim() ?? '',
      firstName: this.contactForm.value.firstName?.trim() ?? '',
      salutation: this.contactForm.value.salutation,
      title: this.contactForm.value.title,
      function: this.contactForm.value.function?.trim() ?? '',
      // emailAddress: this.contactForm.value.emailAddress?.trim() ?? '',
      isInvoiceRecipient: !!this.contactForm.value.isInvoiceRecipient
    };
  }
  handleClose(): void {
    this.isLoading = false;
    this.onVisibility.emit(false);
    this.contactForm.reset();
  }
}

