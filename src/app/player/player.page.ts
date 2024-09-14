import { Component, OnInit } from '@angular/core';
import { PinballService, Player } from '../services/pinball.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {
  players: Player[] = [];
  filteredPlayers: Player[] = [];
  firstName: string = '';
  lastName: string = '';
  isGuest: boolean = false;
  searchTerm: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private pinballService: PinballService,
    private alertController: AlertController,
    private toastController: ToastController  // Added ToastController
  ) {}

  ngOnInit() {
    this.loadPlayers();
  }

  ionViewWillEnter() {
    this.loadPlayers(); // Force reload data when the page is about to be presented
  }

  loadPlayers() {
    this.pinballService.getPlayers().subscribe(
      (players) => {
        this.players = players;
        this.filterPlayers();  // Apply filtering after loading
      },
      (error) => {
        console.error('Failed to load players:', error);
        this.errorMessage = 'Failed to load players. Please try again later.';
      }
    );
  }

  filterPlayers() {
    this.filteredPlayers = this.players.filter(player =>
      player.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  submitForm() {
    const abbreviation = this.generateAbbreviation(this.firstName, this.lastName);
    const playerName = `${this.firstName} ${this.lastName}`;

    this.pinballService.addPlayer(playerName, abbreviation, this.isGuest).subscribe(
      () => {
        this.successMessage = 'Player added successfully.';
        this.clearForm();
        this.loadPlayers();  // Reload the players after adding a new one
      },
      (error: any) => {
        console.error('Failed to add player:', error);
        this.errorMessage = 'Failed to add player. Please try again later.';
      }
    );
  }

  async deletePlayer(abbreviation: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete this player?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.pinballService.deletePlayer(abbreviation).subscribe(
              () => {
                this.successMessage = 'Player deleted successfully.';
                this.loadPlayers();  // Reload the players after deletion
              },
              (error) => {
                console.error('Failed to delete player:', error);
                this.errorMessage = 'Failed to delete player. Please try again later.';
              }
            );
          },
        },
      ],
    });

    await alert.present();
  }

  async toggleGuestStatus(player: Player) {
    // Call the service to toggle the guest status
    this.pinballService.toggleGuestStatus(player.abbreviation).subscribe(
      async () => {
        // Update the player's guest status locally
        player.guest = !player.guest;

        // Show a toast message
        const toast = await this.toastController.create({
          message: `Guest status for ${player.name} updated to ${player.guest ? 'Guest' : 'Regular'}.`,
          duration: 2000,
          position: 'bottom'
        });
        toast.present();

        // Reload the players to get the updated data (optional)
        // this.loadPlayers();
      },
      (error) => {
        console.error('Failed to toggle guest status:', error);
        this.errorMessage = 'Failed to update guest status. Please try again later.';
      }
    );
  }

  generateAbbreviation(firstName: string, lastName: string): string {
    const firstChar = firstName.charAt(0).toUpperCase();
    const secondChar = lastName.charAt(0).toUpperCase();
    const checksum = this.calculateChecksum(firstName, lastName);
    return `${firstChar}${secondChar}${checksum}`;
  }

  calculateChecksum(firstName: string, lastName: string): string {
    const sumFirstName = this.asciiSum(firstName);
    const sumLastName = this.asciiSum(lastName);
    return ((sumFirstName + sumLastName) % 100).toString().padStart(2, '0');
  }

  asciiSum(str: string): number {
    return str.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }

  clearForm() {
    this.firstName = '';
    this.lastName = '';
    this.isGuest = false;
    this.errorMessage = '';
  }
}