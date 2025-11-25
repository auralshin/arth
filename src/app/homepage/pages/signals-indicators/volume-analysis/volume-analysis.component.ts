import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-volume-analysis',
  templateUrl: './volume-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumeAnalysisComponent extends BasePageComponent {}
