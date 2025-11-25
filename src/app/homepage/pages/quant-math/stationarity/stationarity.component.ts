import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-stationarity',
  templateUrl: './stationarity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationarityComponent extends BasePageComponent {}
