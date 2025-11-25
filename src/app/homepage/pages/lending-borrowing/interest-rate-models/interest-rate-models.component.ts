import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-interest-rate-models',
  templateUrl: './interest-rate-models.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterestRateModelsComponent extends BasePageComponent {}
