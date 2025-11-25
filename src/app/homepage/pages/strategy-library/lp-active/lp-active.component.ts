import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lp-active',
  templateUrl: './lp-active.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpActiveComponent extends BasePageComponent {}
