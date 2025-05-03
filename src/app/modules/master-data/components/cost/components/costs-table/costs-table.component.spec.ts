import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostsTableComponent } from './costs-table.component';

describe('CostsTableComponent', () => {
  let component: CostsTableComponent;
  let fixture: ComponentFixture<CostsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
