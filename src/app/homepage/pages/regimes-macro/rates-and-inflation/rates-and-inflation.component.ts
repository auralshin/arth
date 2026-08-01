import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-rates-and-inflation',
  templateUrl: './rates-and-inflation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatesAndInflationComponent extends BasePageComponent {}
