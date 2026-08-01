import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-default-probability',
  templateUrl: './default-probability.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultProbabilityComponent extends BasePageComponent {}
