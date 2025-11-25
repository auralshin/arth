import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-moving-averages',
  templateUrl: './moving-averages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovingAveragesComponent extends BasePageComponent {}
