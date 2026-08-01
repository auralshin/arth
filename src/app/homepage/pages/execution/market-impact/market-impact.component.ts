import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-market-impact',
  templateUrl: './market-impact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketImpactComponent extends BasePageComponent {}
