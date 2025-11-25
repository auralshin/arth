import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-funding-rates',
  templateUrl: './funding-rates.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundingRatesComponent extends BasePageComponent {}
