import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lp-concentrated',
  templateUrl: './lp-concentrated.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpConcentratedComponent extends BasePageComponent {}
