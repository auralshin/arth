import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-purged-cross-validation',
  templateUrl: './purged-cross-validation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurgedCrossValidationComponent extends BasePageComponent {}
