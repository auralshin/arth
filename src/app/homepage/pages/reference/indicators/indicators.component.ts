import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorsComponent extends BasePageComponent {}
