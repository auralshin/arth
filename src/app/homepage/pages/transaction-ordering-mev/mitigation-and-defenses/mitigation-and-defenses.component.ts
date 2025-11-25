import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-mitigation-and-defenses',
  templateUrl: './mitigation-and-defenses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MitigationAndDefensesComponent extends BasePageComponent {}
