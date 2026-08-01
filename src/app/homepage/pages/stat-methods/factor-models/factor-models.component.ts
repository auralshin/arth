import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-factor-models',
  templateUrl: './factor-models.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactorModelsComponent extends BasePageComponent {}
