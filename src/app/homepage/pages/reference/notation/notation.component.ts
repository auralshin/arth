import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-notation',
  templateUrl: './notation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotationComponent extends BasePageComponent {}
