import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-tooling-and-simulation-ecosystem',
  templateUrl: './tooling-and-simulation-ecosystem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolingAndSimulationEcosystemComponent extends BasePageComponent {}
