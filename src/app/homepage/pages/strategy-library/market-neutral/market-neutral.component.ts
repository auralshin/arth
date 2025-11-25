import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-market-neutral',
  templateUrl: './market-neutral.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketNeutralComponent extends BasePageComponent {}
