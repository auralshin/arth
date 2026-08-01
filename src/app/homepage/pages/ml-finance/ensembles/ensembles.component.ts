import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-ensembles',
  templateUrl: './ensembles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnsemblesComponent extends BasePageComponent {}
