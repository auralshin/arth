import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-instrument-map',
  templateUrl: './instrument-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstrumentMapComponent extends BasePageComponent {}
