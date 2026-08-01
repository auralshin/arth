import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-martingales-filtrations',
  templateUrl: './martingales-filtrations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MartingalesFiltrationsComponent extends BasePageComponent {}
