import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-probability-theory',
  templateUrl: './probability-theory.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProbabilityTheoryComponent extends BasePageComponent {}
