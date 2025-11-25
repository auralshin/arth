import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-param-sweeps',
  templateUrl: './param-sweeps.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParamSweepsComponent extends BasePageComponent {}
