import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-agent-based-modeling',
  templateUrl: './agent-based-modeling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentBasedModelingComponent extends BasePageComponent {}
