import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextTableComponent } from './text-table.component';

describe('TextTableComponent', () => {
  let component: TextTableComponent;
  let fixture: ComponentFixture<TextTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
