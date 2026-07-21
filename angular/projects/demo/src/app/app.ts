import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WuiButtonColor, WuiButtonComponent, WuiButtonVariant, WuiFabComponent } from 'weoc-ui-ng';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WuiButtonComponent, WuiFabComponent],
  template: `
    <main style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
      <h1>weoc-ui-ng — Buttons</h1>

      <section style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <wui-button
          *ngFor="let color of colors"
          [color]="color"
          (clicked)="onClick(color)"
        >{{ color }}</wui-button>
      </section>

      <section style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <wui-button
          *ngFor="let variant of variants"
          [variant]="variant"
          color="primary"
        >{{ variant }}</wui-button>
      </section>

      <section style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
        <wui-button *ngFor="let size of sizes" [size]="size" color="secondary">{{ size }}</wui-button>
      </section>

      <section style="display: flex; gap: 0.75rem; align-items: center;">
        <wui-fab color="primary">add</wui-fab>
        <wui-fab color="success" variant="outline">check</wui-fab>
        <wui-fab color="danger" [extended]="true">Delete</wui-fab>
      </section>

      <p>Last clicked: {{ lastClicked }}</p>
    </main>
  `,
})
export class App {
  colors: WuiButtonColor[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
  variants: WuiButtonVariant[] = ['solid', 'outline', 'ghost', 'neon-outline'];
  sizes: Array<'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = ['2xs', 'sm', 'md', 'lg', '2xl'];
  lastClicked = '(none yet)';

  onClick(color: string): void {
    this.lastClicked = color;
  }
}
