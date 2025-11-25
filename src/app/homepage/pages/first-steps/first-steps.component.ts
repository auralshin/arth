import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-first-steps',
  templateUrl: './first-steps.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstStepsComponent extends BasePageComponent {}
