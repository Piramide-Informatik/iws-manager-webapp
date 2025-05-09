import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleTableComponent } from './title-table.component';

describe('TitleTableComponent', () => {
  let component: TitleTableComponent;
  let fixture: ComponentFixture<TitleTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TitleTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
