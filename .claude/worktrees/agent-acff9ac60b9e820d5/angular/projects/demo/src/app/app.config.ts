import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { preset: Aura } }),
    // ConfirmationService backs PrimeNG's ConfirmDialog (p-confirmDialog) —
    // provided app-wide here per PrimeNG's own documented pattern, since
    // this app only has a single root component/route.
    ConfirmationService,
    // MessageService backs PrimeNG's Toast (p-toast), same app-wide pattern.
    MessageService,
  ],
};
