import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-implementation-shortfall',
  templateUrl: './implementation-shortfall.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImplementationShortfallComponent extends BasePageComponent {}
