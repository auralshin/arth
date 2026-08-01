import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-adverse-selection',
  templateUrl: './adverse-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdverseSelectionComponent extends BasePageComponent {}
