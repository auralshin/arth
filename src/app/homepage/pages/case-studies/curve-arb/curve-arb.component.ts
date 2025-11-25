import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-curve-arb',
  templateUrl: './curve-arb.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurveArbComponent extends BasePageComponent {}
