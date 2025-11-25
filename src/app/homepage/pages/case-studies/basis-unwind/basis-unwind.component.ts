import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-basis-unwind',
  templateUrl: './basis-unwind.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasisUnwindComponent extends BasePageComponent {}
