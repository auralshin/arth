import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-overfitting',
  templateUrl: './overfitting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverfittingComponent extends BasePageComponent {}
