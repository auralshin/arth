import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-tooling-simulation-ecosystem',
  templateUrl: './tooling-simulation-ecosystem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolingSimulationEcosystemComponent extends BasePageComponent {}
