import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-pipes',
  templateUrl: './pipes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipesComponent extends BasePageComponent {}
