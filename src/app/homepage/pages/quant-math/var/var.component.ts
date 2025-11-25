import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-var',
  templateUrl: './var.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VarComponent extends BasePageComponent {}
