import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-hedging-lp',
  templateUrl: './hedging-lp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HedgingLpComponent extends BasePageComponent {}
