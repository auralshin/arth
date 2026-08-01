import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-regularisation',
  templateUrl: './regularisation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegularisationComponent extends BasePageComponent {}
