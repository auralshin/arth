import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-statistical-modeling',
  templateUrl: './statistical-modeling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticalModelingComponent extends BasePageComponent {}
