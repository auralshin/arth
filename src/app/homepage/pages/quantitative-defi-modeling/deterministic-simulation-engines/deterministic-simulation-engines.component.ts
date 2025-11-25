import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-deterministic-simulation-engines',
  templateUrl: './deterministic-simulation-engines.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeterministicSimulationEnginesComponent extends BasePageComponent {}
