import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-execution-benchmarks',
  templateUrl: './execution-benchmarks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionBenchmarksComponent extends BasePageComponent {}
