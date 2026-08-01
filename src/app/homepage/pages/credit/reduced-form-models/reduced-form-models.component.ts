import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-reduced-form-models',
  templateUrl: './reduced-form-models.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReducedFormModelsComponent extends BasePageComponent {}
