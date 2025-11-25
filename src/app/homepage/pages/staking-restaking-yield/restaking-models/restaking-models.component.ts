import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-restaking-models',
  templateUrl: './restaking-models.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestakingModelsComponent extends BasePageComponent {}
