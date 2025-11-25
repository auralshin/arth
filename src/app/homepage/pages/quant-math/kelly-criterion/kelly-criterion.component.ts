import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-kelly-criterion',
  templateUrl: './kelly-criterion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KellyCriterionComponent extends BasePageComponent {}
