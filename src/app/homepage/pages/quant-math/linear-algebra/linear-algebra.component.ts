import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-linear-algebra',
  templateUrl: './linear-algebra.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinearAlgebraComponent extends BasePageComponent {}
