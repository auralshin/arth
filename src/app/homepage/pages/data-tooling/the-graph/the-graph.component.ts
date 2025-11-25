import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-the-graph',
  templateUrl: './the-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheGraphComponent extends BasePageComponent {}
