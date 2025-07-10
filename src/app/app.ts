import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Parent } from './Components/parent/parent';

@Component({
  selector: 'app-root',
  imports: [Parent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'final';
}
