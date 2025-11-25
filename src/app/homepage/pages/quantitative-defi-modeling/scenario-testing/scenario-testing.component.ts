import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-scenario-testing',
  templateUrl: './scenario-testing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarioTestingComponent extends BasePageComponent {}
