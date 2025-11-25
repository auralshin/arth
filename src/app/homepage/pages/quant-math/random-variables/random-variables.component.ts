import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-random-variables',
  templateUrl: './random-variables.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RandomVariablesComponent extends BasePageComponent {}
