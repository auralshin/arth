import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-twap-vwap',
  templateUrl: './twap-vwap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwapVwapComponent extends BasePageComponent {}
