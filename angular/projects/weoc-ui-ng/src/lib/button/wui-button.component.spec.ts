import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WuiButtonComponent } from './wui-button.component';

describe('WuiButtonComponent', () => {
  let fixture: ComponentFixture<WuiButtonComponent>;
  let component: WuiButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WuiButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WuiButtonComponent);
    component = fixture.componentInstance;
  });

  function buttonEl(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button')).nativeElement;
  }

  it('renders the base wui-btn class with default modifiers', () => {
    fixture.detectChanges();
    const classes = buttonEl().className.split(' ');
    expect(classes).toContain('wui-btn');
    expect(classes).toContain('primary');
    expect(classes).not.toContain('outline');
    expect(classes).not.toContain('ghost');
  });

  it('applies the size modifier class except for the md default', () => {
    fixture.detectChanges();
    expect(buttonEl().className).not.toMatch(/wui-btn-md/);

    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(buttonEl().className.split(' ')).toContain('wui-btn-lg');
  });

  it('applies variant, color, dashed, and icon-only modifiers', () => {
    fixture.componentRef.setInput('variant', 'outline');
    fixture.componentRef.setInput('color', 'danger');
    fixture.componentRef.setInput('dashed', true);
    fixture.componentRef.setInput('iconOnly', true);
    fixture.detectChanges();

    const classes = buttonEl().className.split(' ');
    expect(classes).toContain('outline');
    expect(classes).toContain('danger');
    expect(classes).toContain('dashed');
    expect(classes).toContain('icon-only');
  });

  it('reflects the disabled input onto the native button', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(buttonEl().disabled).toBe(true);
  });

  it('emits clicked with the native MouseEvent on click', () => {
    fixture.detectChanges();
    let seen: MouseEvent | undefined;
    component.clicked.subscribe((e: MouseEvent) => (seen = e));

    buttonEl().click();

    expect(seen).toBeInstanceOf(MouseEvent);
  });

  it('does not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let calls = 0;
    component.clicked.subscribe(() => calls++);

    buttonEl().click();

    expect(calls).toBe(0);
  });
});
