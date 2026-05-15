import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  visible = true;
  fading  = false;

  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading.subscribe((v) => {
      if (v) {
        this.fading  = false;
        this.visible = true;
      } else {
        this.fading = true;
        setTimeout(() => {
          this.visible = false;
          this.fading  = false;
        }, 400);
      }
    });
  }

  ngOnInit(): void {}
}
