import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewEncapsulation, input } from '@angular/core';
import { WuiButtonColor, WuiButtonSize, WuiButtonVariant } from '../button/wui-button.component';

@Component({
  selector: 'wui-fab',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [class]="hostClasses"
      [disabled]="disabled()"
      (click)="onClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class WuiFabComponent {
  variant = input<WuiButtonVariant>('solid');
  color = input<WuiButtonColor>('primary');
  size = input<WuiButtonSize>('md');
  disabled = input(false);
  extended = input(false);
  fixedBottomRight = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');

  @Output() clicked = new EventEmitter<MouseEvent>();

  get hostClasses(): string {
    const classes = ['wui-fab'];
    const size = this.size();
    const variant = this.variant();
    const color = this.color();

    if (size !== 'md') {
      classes.push(`wui-fab-${size}`);
    }

    if (variant === 'outline') {
      classes.push('outline', color);
    } else if (variant === 'ghost') {
      classes.push('ghost', color);
    } else if (variant === 'neon-outline') {
      classes.push('neon-outline', color);
    } else {
      classes.push(color);
    }

    if (this.extended()) {
      classes.push('wui-fab-extended');
    }
    if (this.fixedBottomRight()) {
      classes.push('wui-fab-fixed-br');
    }

    return classes.join(' ');
  }

  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    this.clicked.emit(event);
  }
}
