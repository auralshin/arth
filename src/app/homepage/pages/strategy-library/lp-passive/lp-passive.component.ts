import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lp-passive',
  templateUrl: './lp-passive.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpPassiveComponent extends BasePageComponent {}
