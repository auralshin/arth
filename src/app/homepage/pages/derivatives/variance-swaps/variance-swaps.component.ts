import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-variance-swaps',
  templateUrl: './variance-swaps.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VarianceSwapsComponent extends BasePageComponent {}
