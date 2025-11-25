import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-formulas',
  templateUrl: './formulas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulasComponent extends BasePageComponent {}
