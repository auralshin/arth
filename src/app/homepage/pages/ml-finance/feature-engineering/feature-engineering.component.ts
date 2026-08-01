import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-feature-engineering',
  templateUrl: './feature-engineering.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureEngineeringComponent extends BasePageComponent {}
