import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-arima',
  templateUrl: './arima.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArimaComponent extends BasePageComponent {}
