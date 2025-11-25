import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineComponent extends BasePageComponent {}
