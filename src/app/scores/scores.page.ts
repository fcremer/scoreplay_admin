import { Component, OnInit } from '@angular/core';
import { PinballService, PinballMachine, Score } from '../services/pinball.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.page.html',
  styleUrls: ['./scores.page.scss'],
})
export class ScoresPage implements OnInit {
  pinballMachines: PinballMachine[] = [];
  filteredPinballMachines: PinballMachine[] = [];
  scoresByMachine: { [key: string]: Score[] } = {};
  searchTerm: string = '';
  errorMessage: string = '';

  constructor(
    private pinballService: PinballService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadPinballMachines();
  }

  loadPinballMachines() {
    this.pinballService.getPinballMachines().subscribe(
      (data) => {
        this.pinballMachines = data;
        this.filteredPinballMachines = data; // Initialize filtered machines with all machines
        this.loadScores();
      },
      (error) => {
        this.errorMessage = 'Could not load pinball machines. Please try again later.';
        console.error('Failed to load pinball machines:', error);
      }
    );
  }

  loadScores() {
    this.pinballService.getAllScoresForToday().subscribe(
      (data) => {
        this.scoresByMachine = data;
      },
      (error) => {
        this.errorMessage = 'Could not load scores. Please try again later.';
        console.error('Failed to load scores:', error);
      }
    );
  }

  filterPinballMachines() {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredPinballMachines = this.pinballMachines.filter((machine) =>
      machine.long_name.toLowerCase().includes(searchTermLower)
    );
  }

  async confirmDelete(score: Score) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the score for ${score.player_abbreviation} with ${score.points} points?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteScore(score);
          },
        },
      ],
    });

    await alert.present();
  }

  deleteScore(score: Score) {
    this.pinballService.deleteScore(score.pinball_abbreviation, score.player_abbreviation, score.points).subscribe(
      () => {
        this.loadScores(); // Refresh scores after deletion
        this.showAlert('Success', 'Score deleted successfully.');
      },
      (error) => {
        console.error('Failed to delete score:', error);
        this.showAlert('Error', 'Failed to delete score. Please try again later.');
      }
    );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}