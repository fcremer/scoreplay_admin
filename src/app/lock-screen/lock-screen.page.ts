import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular'; // Import Storage

@Component({
  selector: 'app-lock-screen',
  templateUrl: './lock-screen.page.html',
  styleUrls: ['./lock-screen.page.scss'],
})
export class LockScreenPage implements OnInit {
  enteredPin: string = '';
  correctPin: string = '';

  constructor(private navCtrl: NavController, private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create(); // Initialize storage
    this.correctPin = await this.storage.get('pin') || '1234'; // Retrieve the stored PIN, or use a default
  }

  async onNumberClick(num: string) {
    if (this.enteredPin.length < 4) {
      this.enteredPin += num;
    }
    if (this.enteredPin.length === 4) {
      await this.verifyPin();
    }
  }

  async verifyPin() {
    if (this.enteredPin === this.correctPin) {
      await this.storage.set('isAuthenticated', true); // Set authentication state
      this.navCtrl.navigateRoot('/tabs/scores'); // Navigate to the scores page
    } else {
      this.enteredPin = ''; // Reset PIN entry on failure
      alert('Incorrect PIN. Please try again.');
    }
  }

  clearPin() {
    this.enteredPin = '';
  }
}