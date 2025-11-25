import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-sortino',
  templateUrl: './sortino.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortinoComponent extends BasePageComponent {}
