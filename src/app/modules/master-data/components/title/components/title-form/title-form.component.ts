import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '../../../../../../Entities/title';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TitleStateService } from '../../utils/title-state.service';
import { TitleUtils } from '../../utils/title-utils';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-title-form',
  templateUrl: './title-form.component.html',
  styleUrls: ['./title-form.component.scss'],
  standalone: false,
  providers: [MessageService]
})
export class TitleFormComponent implements OnInit, OnDestroy {
  currentTitle: Title | null = null;
  editTitleForm!: FormGroup;
  isSaving = false;
  private subscriptions = new Subscription();
  private editTitleSource = new BehaviorSubject<Title | null>(null);

  constructor(
    private titleUtils: TitleUtils, 
    private titleStateService: TitleStateService,
    private messageService: MessageService,
    private translate: TranslateService
  ){}

  ngOnInit(): void {
    this.initForm();
    this.setupTitleSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setTitleToEdit(title: Title | null) { 
    this.editTitleSource.next(title);
  }

  private initForm(): void {
    this.editTitleForm = new FormGroup({
      title: new FormControl('', [Validators.required])
    });
  }

  private setupTitleSubscription(): void {
    this.subscriptions.add(
      this.titleStateService.currentTitle$.subscribe(title => {
        this.currentTitle = title;
        title ? this.loadTitleData(title) : this.clearForm();
      })
    );
  }

  private loadTitleData(title: Title): void {
    this.editTitleForm.patchValue({ title: title.name });
  }

  clearForm(): void {
    this.editTitleForm.reset();
    this.currentTitle = null;
    this.isSaving = false;
  }

  onSubmit(): void {
    if (this.editTitleForm.invalid ?? !this.currentTitle ?? this.isSaving) {
      this.markAllAsTouched();
      return;
    }
  
    this.isSaving = true;
    const updatedTitle: Title = {
      ...this.currentTitle,
      name: this.editTitleForm.value.title 
    };
  
    this.subscriptions.add(
      this.titleUtils.updateTitle(updatedTitle).subscribe({
        next: (savedTitle) => this.handleSaveSuccess(savedTitle),
        error: (err) => this.handleSaveError(err)
      })
    );
  }

  private handleSaveSuccess(savedTitle: Title): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('SUCCESS'),
      detail: this.translate.instant('TITLE.SUCCESS.UPDATED')
    });
    this.titleStateService.setTitleToEdit(null);
    this.clearForm();
  }

  private handleSaveError(error: any): void {
    console.error('Error saving title:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('ERROR'),
      detail: this.translate.instant('TITLE.ERROR.UPDATE_FAILED')
    });
    this.isSaving = false;
  }

  private markAllAsTouched(): void {
    Object.values(this.editTitleForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }
}