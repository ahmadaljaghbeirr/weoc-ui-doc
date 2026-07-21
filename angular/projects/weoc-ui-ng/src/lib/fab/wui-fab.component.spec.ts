import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WuiFabComponent } from './wui-fab.component';

describe('WuiFabComponent', () => {
  let fixture: ComponentFixture<WuiFabComponent>;
  let component: WuiFabComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WuiFabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WuiFabComponent);
    component = fixture.componentInstance;
  });

  function buttonEl(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button')).nativeElement;
  }

  it('renders the base wui-fab class with default modifiers', () => {
    fixture.detectChanges();
    const classes = buttonEl().className.split(' ');
    expect(classes).toContain('wui-fab');
    expect(classes).toContain('primary');
  });

  it('applies the size modifier class except for the md default', () => {
    fixture.detectChanges();
    expect(buttonEl().className).not.toMatch(/wui-fab-md/);

    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(buttonEl().className.split(' ')).toContain('wui-fab-sm');
  });

  it('applies extended and fixedBottomRight modifiers', () => {
    fixture.componentRef.setInput('extended', true);
    fixture.componentRef.setInput('fixedBottomRight', true);
    fixture.detectChanges();

    const classes = buttonEl().className.split(' ');
    expect(classes).toContain('wui-fab-extended');
    expect(classes).toContain('wui-fab-fixed-br');
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
