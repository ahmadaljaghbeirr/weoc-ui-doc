// jest-preset-angular 17.x removed the top-level `setup-jest` subpath used by older
// preset versions; the zoneless entry point below matches what this workspace uses
// (no zone.js dependency, no provideZoneChangeDetection() in app.config.ts).
import 'jest-preset-angular/setup-env/zoneless';
