import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleFormComponent } from './title-form.component';

describe('TitleFormComponent', () => {
  let component: TitleFormComponent;
  let fixture: ComponentFixture<TitleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TitleFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
