import { Component, OnInit } from '@angular/core';
import { PinballService, PinballMachine, Score, Player } from '../services/pinball.service';
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
  playerMap: { [key: string]: string } = {}; // Map player abbreviation to full name
  searchTerm: string = '';
  errorMessage: string = '';

  constructor(
    private pinballService: PinballService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadPlayers();
  }

  loadPlayers() {
    this.pinballService.getPlayers().subscribe(
      (data: Player[]) => {
        this.playerMap = data.reduce((map: { [key: string]: string }, player: Player) => {
          map[player.abbreviation] = player.name;
          return map;
        }, {});
        this.loadPinballMachines(); // Load pinball machines after loading players
      },
      (error: any) => {
        this.errorMessage = 'Could not load players. Please try again later.';
        console.error('Failed to load players:', error);
      }
    );
  }

  loadPinballMachines() {
    this.pinballService.getPinballMachines().subscribe(
      (data: PinballMachine[]) => {
        this.pinballMachines = data;
        this.loadScores();
      },
      (error: any) => {
        this.errorMessage = 'Could not load pinball machines. Please try again later.';
        console.error('Failed to load pinball machines:', error);
      }
    );
  }

  loadScores() {
    this.pinballService.getAllScoresForToday().subscribe(
      (data: { [key: string]: Score[] }) => {
        this.scoresByMachine = data;
        this.filterPinballMachines(); // Initial filter based on scores
      },
      (error: any) => {
        this.errorMessage = 'Could not load scores. Please try again later.';
        console.error('Failed to load scores:', error);
      }
    );
  }

  filterPinballMachines() {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredPinballMachines = this.pinballMachines.filter((machine) => {
      const hasScores = this.scoresByMachine[machine.abbreviation] && this.scoresByMachine[machine.abbreviation].length > 0;
      const matchesSearchTerm = machine.long_name.toLowerCase().includes(searchTermLower);
      return hasScores && matchesSearchTerm;
    });
  }

  getPlayerName(abbreviation: string): string {
    return this.playerMap[abbreviation] || abbreviation;
  }

  async confirmDelete(score: Score) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the score for ${this.getPlayerName(score.player_abbreviation)} with ${score.points} points?`,
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
      (error: any) => {
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