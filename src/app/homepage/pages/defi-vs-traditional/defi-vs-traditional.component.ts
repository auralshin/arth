import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-defi-vs-traditional',
  templateUrl: './defi-vs-traditional.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefiVsTraditionalComponent extends BasePageComponent {}
