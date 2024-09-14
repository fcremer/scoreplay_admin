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
  originalScoresByMachine: { [key: string]: Score[] } = {}; // Store original scores
  playerMap: { [key: string]: string } = {}; // Map player abbreviation to full name
  searchTerm: string = '';
  errorMessage: string = '';
  scoreFilter: string = 'latest'; // 'latest' or 'all'

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
        this.playerMap = data.reduce(
          (map: { [key: string]: string }, player: Player) => {
            map[player.abbreviation] = player.name;
            return map;
          },
          {}
        );
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
    this.pinballService.getAllScores(this.scoreFilter).subscribe(
      (data: { [key: string]: Score[] }) => {
        // Store original scores to preserve unfiltered data
        this.originalScoresByMachine = JSON.parse(JSON.stringify(data));
        this.scoresByMachine = JSON.parse(JSON.stringify(data));
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

    // Reset scoresByMachine to original data before filtering
    this.scoresByMachine = JSON.parse(JSON.stringify(this.originalScoresByMachine));

    // Filter machines that have scores and match the search term
    this.filteredPinballMachines = this.pinballMachines.filter((machine) => {
      const hasScores =
        this.scoresByMachine[machine.abbreviation] &&
        this.scoresByMachine[machine.abbreviation].length > 0;

      if (!hasScores) {
        return false;
      }

      const machineNameMatches = machine.long_name.toLowerCase().includes(searchTermLower);

      // Check if any player name in this machine's scores matches the search term
      const playerNameMatches = this.scoresByMachine[machine.abbreviation].some((score) => {
        const playerName = this.getPlayerName(score.player_abbreviation).toLowerCase();
        return playerName.includes(searchTermLower);
      });

      // Include the machine if either the machine name or any player name matches
      return machineNameMatches || playerNameMatches;
    });

    // Filter scores within each machine to include only those that match the search term
    this.filteredPinballMachines.forEach((machine) => {
      this.scoresByMachine[machine.abbreviation] = this.scoresByMachine[
        machine.abbreviation
      ].filter((score) => {
        const playerName = this.getPlayerName(score.player_abbreviation).toLowerCase();
        const playerNameMatches = playerName.includes(searchTermLower);
        const machineNameMatches = machine.long_name.toLowerCase().includes(searchTermLower);
        return playerNameMatches || machineNameMatches;
      });
    });
  }

  resetFilters() {
    this.searchTerm = '';
    // Reset filtered data to original data
    this.scoresByMachine = JSON.parse(JSON.stringify(this.originalScoresByMachine));
    this.filteredPinballMachines = [...this.pinballMachines];
  }

  getPlayerName(abbreviation: string): string {
    return this.playerMap[abbreviation] || abbreviation;
  }

  async confirmDelete(score: Score) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the score for ${this.getPlayerName(
        score.player_abbreviation
      )} with ${score.points} points?`,
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
    this.pinballService
      .deleteScore(score.pinball_abbreviation, score.player_abbreviation, score.points)
      .subscribe(
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