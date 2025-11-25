import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-oracle-manipulation',
  templateUrl: './oracle-manipulation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OracleManipulationComponent extends BasePageComponent {}
