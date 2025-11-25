import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-mm-lite',
  templateUrl: './mm-lite.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MmLiteComponent extends BasePageComponent {}
