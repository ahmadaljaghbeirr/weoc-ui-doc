import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

export type WuiButtonVariant = 'solid' | 'outline' | 'ghost' | 'neon-outline';
export type WuiButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type WuiButtonSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

@Component({
  selector: 'wui-button',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [class]="hostClasses"
      [disabled]="disabled"
      (click)="onClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class WuiButtonComponent {
  private _variant: WuiButtonVariant = 'solid';
  private _color: WuiButtonColor = 'primary';
  private _size: WuiButtonSize = 'md';
  private _disabled = false;
  private _dashed = false;
  private _iconOnly = false;
  private _type: 'button' | 'submit' | 'reset' = 'button';

  @Input() set variant(value: WuiButtonVariant) {
    this._variant = value;
    this.cdr.markForCheck();
  }
  get variant(): WuiButtonVariant {
    return this._variant;
  }

  @Input() set color(value: WuiButtonColor) {
    this._color = value;
    this.cdr.markForCheck();
  }
  get color(): WuiButtonColor {
    return this._color;
  }

  @Input() set size(value: WuiButtonSize) {
    this._size = value;
    this.cdr.markForCheck();
  }
  get size(): WuiButtonSize {
    return this._size;
  }

  @Input() set disabled(value: boolean) {
    this._disabled = value;
    this.cdr.markForCheck();
  }
  get disabled(): boolean {
    return this._disabled;
  }

  @Input() set dashed(value: boolean) {
    this._dashed = value;
    this.cdr.markForCheck();
  }
  get dashed(): boolean {
    return this._dashed;
  }

  @Input() set iconOnly(value: boolean) {
    this._iconOnly = value;
    this.cdr.markForCheck();
  }
  get iconOnly(): boolean {
    return this._iconOnly;
  }

  @Input() set type(value: 'button' | 'submit' | 'reset') {
    this._type = value;
    this.cdr.markForCheck();
  }
  get type(): 'button' | 'submit' | 'reset' {
    return this._type;
  }

  @Output() clicked = new EventEmitter<MouseEvent>();

  constructor(private cdr: ChangeDetectorRef) {}

  get hostClasses(): string {
    const classes = ['wui-btn'];

    if (this.size !== 'md') {
      classes.push(`wui-btn-${this.size}`);
    }

    if (this.variant === 'outline') {
      classes.push('outline', this.color);
    } else if (this.variant === 'ghost') {
      classes.push('ghost', this.color);
    } else if (this.variant === 'neon-outline') {
      classes.push('neon-outline', this.color);
    } else {
      classes.push(this.color);
    }

    if (this.dashed) {
      classes.push('dashed');
    }
    if (this.iconOnly) {
      classes.push('icon-only');
    }

    return classes.join(' ');
  }

  onClick(event: MouseEvent): void {
    if (this.disabled) {
      return;
    }
    this.clicked.emit(event);
  }
}
