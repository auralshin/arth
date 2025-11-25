import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-review-process',
  templateUrl: './review-process.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewProcessComponent extends BasePageComponent {}
