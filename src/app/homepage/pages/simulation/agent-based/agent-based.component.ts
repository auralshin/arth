import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-agent-based',
  templateUrl: './agent-based.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentBasedComponent extends BasePageComponent {}
