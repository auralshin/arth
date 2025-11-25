import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-core-math-tools',
  templateUrl: './core-math-tools.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoreMathToolsComponent extends BasePageComponent {}
