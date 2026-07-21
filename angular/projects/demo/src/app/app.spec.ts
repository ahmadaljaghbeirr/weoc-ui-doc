import { TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // App's constructor injects ConfirmationService (for its ConfirmDialog
      // demo) and MessageService (for its Toast demo) — app.config.ts
      // provides both app-wide at bootstrap, but TestBed only loads the
      // standalone App component here, so both must be provided explicitly
      // for the injector to resolve them. (The ConfirmDialog task originally
      // missed this for ConfirmationService — provided proactively for
      // MessageService this time.)
      providers: [ConfirmationService, MessageService],
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
