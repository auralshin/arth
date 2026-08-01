import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-delta-hedging',
  templateUrl: './delta-hedging.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeltaHedgingComponent extends BasePageComponent {}
