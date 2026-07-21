import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WuiButtonColor, WuiButtonComponent, WuiButtonVariant, WuiFabComponent } from 'weoc-ui-ng';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Popover } from 'primeng/popover';
import { Dialog } from 'primeng/dialog';
import { Drawer } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WuiButtonComponent, WuiFabComponent, Select, DatePicker, Popover, Dialog, Drawer, Button, ConfirmDialog, Toast, Tabs, TabList, Tab, TabPanels, TabPanel],
  template: `
    <main style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
      <h1>weoc-ui-ng — Buttons</h1>

      <p-confirmdialog />
      <p-toast />

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
            <div style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
              <span>This popover is skinned entirely via weoc-ui-css tokens overriding PrimeNG's --p-popover-* variables.</span>
              <p-button label="Confirm" severity="success" size="small" />
            </div>
          </p-popover>
        </div>
      </section>

      <section style="display: flex; gap: 1rem; align-items: flex-start;">
        <div>
          <label>PrimeNG Dialog, restyled with weoc-ui-css tokens</label><br />
          <button type="button" (click)="dialogVisible = true" style="padding: 0.5rem 1rem;">Open dialog</button>
          <p-dialog header="weoc-ui-styled Dialog" [modal]="true" [(visible)]="dialogVisible" [style]="{ width: '28rem' }">
            <p>This dialog is skinned entirely via weoc-ui-css tokens overriding PrimeNG's --p-dialog-* variables.</p>
            <ng-template #footer>
              <p-button label="Cancel" severity="secondary" [text]="true" (click)="dialogVisible = false" />
              <p-button label="Delete" severity="danger" (click)="dialogVisible = false" />
            </ng-template>
          </p-dialog>
        </div>
      </section>

      <section style="display: flex; gap: 1rem; align-items: flex-start;">
        <div>
          <label>PrimeNG Drawer, restyled with weoc-ui-css tokens</label><br />
          <button type="button" (click)="drawerVisible = true" style="padding: 0.5rem 1rem;">Open drawer</button>
          <p-drawer header="weoc-ui-styled Drawer" [(visible)]="drawerVisible" position="right">
            <p>This drawer is skinned entirely via weoc-ui-css tokens overriding PrimeNG's --p-drawer-* variables.</p>
            <ng-template #footer>
              <p-button label="Save" severity="primary" [outlined]="true" (click)="drawerVisible = false" />
            </ng-template>
          </p-drawer>
        </div>
      </section>

      <section style="display: flex; gap: 1rem; align-items: flex-start;">
        <div>
          <label>PrimeNG ConfirmDialog, restyled with weoc-ui-css tokens</label><br />
          <button type="button" (click)="confirmDelete()" style="padding: 0.5rem 1rem;">Trigger confirm</button>
        </div>
      </section>

      <section style="display: flex; gap: 0.75rem; align-items: center;">
        <div>
          <label>PrimeNG Toast, restyled with weoc-ui-css tokens</label><br />
          <div style="display: flex; gap: 0.5rem;">
            <button type="button" (click)="showToast('success')">Success</button>
            <button type="button" (click)="showToast('info')">Info</button>
            <button type="button" (click)="showToast('warn')">Warn</button>
            <button type="button" (click)="showToast('error')">Error</button>
          </div>
        </div>
      </section>

      <section>
        <label>PrimeNG Tabs, restyled with weoc-ui-css tokens</label><br />
        <p-tabs value="0">
          <p-tablist>
            <p-tab value="0">Overview</p-tab>
            <p-tab value="1">Details</p-tab>
            <p-tab value="2">Settings</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="0">Overview panel content.</p-tabpanel>
            <p-tabpanel value="1">Details panel content.</p-tabpanel>
            <p-tabpanel value="2">Settings panel content.</p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </section>

      <p>Last clicked: {{ lastClicked }}</p>
      <p>Last confirm result: {{ lastConfirmResult }}</p>
    </main>
  `,
})
export class App {
  colors: WuiButtonColor[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
  variants: WuiButtonVariant[] = ['solid', 'outline', 'ghost', 'neon-outline'];
  sizes: Array<'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = ['2xs', 'sm', 'md', 'lg', '2xl'];
  lastClicked = '(none yet)';
  dialogVisible = false;
  drawerVisible = false;
  lastConfirmResult = '(none yet)';

  primeOptions = [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Success', value: 'success' },
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  onClick(color: string): void {
    this.lastClicked = color;
  }

  showToast(severity: string): void {
    this.messageService.add({ severity, summary: severity, detail: `This is a ${severity} toast, restyled with weoc-ui-css tokens.` });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to proceed?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.lastConfirmResult = 'accepted';
      },
      reject: () => {
        this.lastConfirmResult = 'rejected';
      },
    });
  }
}
