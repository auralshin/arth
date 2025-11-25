import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-guards',
  templateUrl: './guards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuardsComponent extends BasePageComponent {}
