import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WuiButtonColor, WuiButtonComponent, WuiButtonVariant, WuiFabComponent } from 'weoc-ui-ng';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Popover } from 'primeng/popover';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WuiButtonComponent, WuiFabComponent, Select, DatePicker, Popover, Dialog],
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

      <section style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
        <div>
          <label>PrimeNG Select, restyled with weoc-ui-css tokens</label><br />
          <p-select [options]="primeOptions" optionLabel="label" placeholder="Choose one" />
        </div>
        <div>
          <label>PrimeNG DatePicker, restyled with weoc-ui-css tokens</label><br />
          <p-datepicker />
        </div>
      </section>

      <section style="display: flex; gap: 1rem; align-items: flex-start;">
        <div>
          <label>PrimeNG Popover, restyled with weoc-ui-css tokens</label><br />
          <button type="button" (click)="pop.toggle($event)" style="padding: 0.5rem 1rem;">Toggle popover</button>
          <p-popover #pop>
            <div style="padding: 0.5rem;">This popover is skinned entirely via weoc-ui-css tokens overriding PrimeNG's --p-popover-* variables.</div>
          </p-popover>
        </div>
      </section>

      <section style="display: flex; gap: 1rem; align-items: flex-start;">
        <div>
          <label>PrimeNG Dialog, restyled with weoc-ui-css tokens</label><br />
          <button type="button" (click)="dialogVisible = true" style="padding: 0.5rem 1rem;">Open dialog</button>
          <p-dialog header="weoc-ui-styled Dialog" [modal]="true" [(visible)]="dialogVisible" [style]="{ width: '28rem' }">
            <p>This dialog is skinned entirely via weoc-ui-css tokens overriding PrimeNG's --p-dialog-* variables.</p>
          </p-dialog>
        </div>
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
  dialogVisible = false;

  primeOptions = [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Success', value: 'success' },
  ];

  onClick(color: string): void {
    this.lastClicked = color;
  }
}
