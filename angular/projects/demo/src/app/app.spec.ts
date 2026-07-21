import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // App's constructor injects ConfirmationService (for its ConfirmDialog
      // demo) — app.config.ts provides it app-wide at bootstrap, but
      // TestBed only loads the standalone App component here, so it must be
      // provided explicitly for the injector to resolve it.
      providers: [ConfirmationService],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('weoc-ui-ng');
  });
});
