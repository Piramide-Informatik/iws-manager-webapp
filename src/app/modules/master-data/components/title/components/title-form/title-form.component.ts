import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '../../../../../../Entities/title';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TitleStateService } from '../../utils/title-state.service';
import { TitleUtils } from '../../utils/title-utils';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-title-form',
  templateUrl: './title-form.component.html',
  styleUrls: ['./title-form.component.scss'],
  standalone: false,
})
export class TitleFormComponent implements OnInit, OnDestroy {
  public showOCCErrorModaTitle = false;
  currentTitle: Title | null = null;
  editTitleForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  private readonly editTitleSource = new BehaviorSubject<Title | null>(null);

  constructor(
    private readonly titleUtils: TitleUtils,
    private readonly titleStateService: TitleStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.setupTitleSubscription();
    // Check if we need to load a title after page refresh
    const savedTitleId = localStorage.getItem('selectedTitleId');
    if (savedTitleId) {
      this.loadTitleAfterRefresh(savedTitleId);
      localStorage.removeItem('selectedTitleId');
    }
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

  private loadTitleAfterRefresh(titleId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.titleUtils.getTitleById(Number(titleId)).subscribe({
        next: (title) => {
          if (title) {
            this.titleStateService.setTitleToEdit(title);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      })
    );
  }

  clearForm(): void {
    this.editTitleForm.reset();
    this.currentTitle = null;
    this.isSaving = false;
  }

  onSubmit(): void {
    if (this.editTitleForm.invalid || !this.currentTitle || this.isSaving) {
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
        error: (err) => this.handleError(err)
      })
    );
  }

  onRefresh(): void {
    if (this.currentTitle?.id) {
      localStorage.setItem('selectedTitleId', this.currentTitle.id.toString());
      window.location.reload();
    }
  }

  private handleError(err: any): void {
    if (err.message === 'Version conflict: Title has been updated by another user') {
      this.showOCCErrorModaTitle = true;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveSuccess(savedTitle: Title): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('TITLE.MESSAGE.SUCCESS'),
      detail: this.translate.instant('TITLE.MESSAGE.UPDATE_SUCCESS')
    });
    this.titleStateService.setTitleToEdit(null);
    this.clearForm();
  }

  private handleSaveError(error: any): void {
    console.error('Error saving title:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('TITLE.MESSAGE.ERROR'),
      detail: this.translate.instant('TITLE.MESSAGE.UPDATE_FAILED')
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