import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-calculus',
  templateUrl: './calculus.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculusComponent extends BasePageComponent {}
