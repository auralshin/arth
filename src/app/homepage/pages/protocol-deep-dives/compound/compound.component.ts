import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompoundComponent extends BasePageComponent {}
