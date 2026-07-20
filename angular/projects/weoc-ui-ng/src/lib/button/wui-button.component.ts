import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewEncapsulation, input } from '@angular/core';

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
      [type]="type()"
      [class]="hostClasses"
      [disabled]="disabled()"
      (click)="onClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class WuiButtonComponent {
  variant = input<WuiButtonVariant>('solid');
  color = input<WuiButtonColor>('primary');
  size = input<WuiButtonSize>('md');
  disabled = input(false);
  dashed = input(false);
  iconOnly = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');

  @Output() clicked = new EventEmitter<MouseEvent>();

  get hostClasses(): string {
    const classes = ['wui-btn'];
    const size = this.size();
    const variant = this.variant();
    const color = this.color();

    if (size !== 'md') {
      classes.push(`wui-btn-${size}`);
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

    if (this.dashed()) {
      classes.push('dashed');
    }
    if (this.iconOnly()) {
      classes.push('icon-only');
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
