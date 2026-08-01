import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-cointegration',
  templateUrl: './cointegration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CointegrationComponent extends BasePageComponent {}
