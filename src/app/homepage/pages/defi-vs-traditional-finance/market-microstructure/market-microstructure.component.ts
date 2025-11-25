import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-market-microstructure',
  templateUrl: './market-microstructure.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketMicrostructureComponent extends BasePageComponent {}
