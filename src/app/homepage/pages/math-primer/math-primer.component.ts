import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-math-primer',
  templateUrl: './math-primer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MathPrimerComponent extends BasePageComponent {}
