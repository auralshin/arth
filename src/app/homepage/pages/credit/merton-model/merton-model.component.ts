import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-merton-model',
  templateUrl: './merton-model.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MertonModelComponent extends BasePageComponent {}
