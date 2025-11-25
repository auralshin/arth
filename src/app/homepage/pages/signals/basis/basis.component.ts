import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-basis',
  templateUrl: './basis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasisComponent extends BasePageComponent {}
