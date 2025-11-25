import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-concentrated-lp',
  templateUrl: './concentrated-lp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcentratedLpComponent extends BasePageComponent {}
