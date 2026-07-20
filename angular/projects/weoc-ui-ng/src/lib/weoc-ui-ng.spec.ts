import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeocUiNg } from './weoc-ui-ng';

describe('WeocUiNg', () => {
  let component: WeocUiNg;
  let fixture: ComponentFixture<WeocUiNg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeocUiNg],
    }).compileComponents();

    fixture = TestBed.createComponent(WeocUiNg);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
