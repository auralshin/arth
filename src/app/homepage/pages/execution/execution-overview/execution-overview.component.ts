import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-execution-overview',
  templateUrl: './execution-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionOverviewComponent extends BasePageComponent {}
