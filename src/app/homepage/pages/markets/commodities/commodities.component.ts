import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-commodities',
  templateUrl: './commodities.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommoditiesComponent extends BasePageComponent {}
