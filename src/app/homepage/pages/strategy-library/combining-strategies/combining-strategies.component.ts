import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-combining-strategies',
  templateUrl: './combining-strategies.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombiningStrategiesComponent extends BasePageComponent {}
