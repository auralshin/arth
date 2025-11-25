import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-yield-decomposition',
  templateUrl: './yield-decomposition.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YieldDecompositionComponent extends BasePageComponent {}
