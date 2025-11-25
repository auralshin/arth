import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-regulation-and-custody',
  templateUrl: './regulation-and-custody.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegulationAndCustodyComponent extends BasePageComponent {}
