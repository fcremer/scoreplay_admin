import { Component, OnInit, OnDestroy } from '@angular/core';
import { PinballService, Player } from '../services/pinball.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
  tournaments: string[] = [];
  activeTournament!: string; // Use definite assignment assertion

  private dataReloadSubscription!: Subscription; // Use definite assignment assertion

  constructor(
    private pinballService: PinballService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadTournaments();

    // Subscribe to data reload notifications
    this.dataReloadSubscription = this.pinballService.getDataReloadObservable().subscribe(() => {
      this.loadTournaments();
    });
  }

  ngOnDestroy() {
    if (this.dataReloadSubscription) {
      this.dataReloadSubscription.unsubscribe();
    }
  }

  async loadTournaments() {
    const loading = await this.loadingController.create({
      message: 'Loading tournaments...'
    });
    await loading.present();

    this.pinballService.getActiveTournament().subscribe(
      (activeTournamentData: { active_tournament_name: string }) => {
        this.activeTournament = activeTournamentData.active_tournament_name;

        this.pinballService.getTournaments().subscribe(
          (tournamentsData: string[]) => {
            this.tournaments = tournamentsData;
            loading.dismiss();
          },
          (error: HttpErrorResponse) => {
            console.error('Error loading tournaments:', error);
            loading.dismiss();
          }
        );
      },
      (error: HttpErrorResponse) => {
        console.error('Error getting active tournament:', error);
        loading.dismiss();
      }
    );
  }

  async setActiveTournament(tournamentName: string) {
    const loading = await this.loadingController.create({
      message: 'Setting active tournament...'
    });
    await loading.present();

    this.pinballService.setActiveTournament(tournamentName).subscribe(
      (response: { message: string }) => {
        this.activeTournament = tournamentName;
        loading.dismiss();
        this.showToast(`Active tournament set to ${tournamentName}`);
        this.pinballService.triggerDataReload(); // Notify other components
      },
      (error: HttpErrorResponse) => {
        console.error('Error setting active tournament:', error);
        loading.dismiss();
        this.showToast('Error setting active tournament');
      }
    );
  }

  async createTournament() {
    const alert = await this.alertController.create({
      header: 'Create New Tournament',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Tournament Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create Empty',
          handler: (data: { name: string }) => {
            this.pinballService.createTournament(data.name).subscribe(
              (response: { message: string }) => {
                this.showToast('Tournament created');
                this.loadTournaments();
              },
              (error: HttpErrorResponse) => {
                console.error('Error creating tournament:', error);
                this.showToast('Error creating tournament');
              }
            );
          }
        },
        {
          text: 'Clone Existing',
          handler: (data: { name: string }) => {
            this.chooseTemplateTournament(data.name);
          }
        }
      ]
    });

    await alert.present();
  }

  async chooseTemplateTournament(newTournamentName: string) {
    const alert = await this.alertController.create({
      header: 'Select Template Tournament',
      inputs: this.tournaments.map(t => ({
        name: 'template',
        type: 'radio',
        label: t,
        value: t
      })),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clone',
          handler: (templateTournamentName: string) => {
            this.pinballService.createTournament(newTournamentName, templateTournamentName).subscribe(
              (response: { message: string }) => {
                this.showToast('Tournament cloned');
                this.loadTournaments();
              },
              (error: HttpErrorResponse) => {
                console.error('Error cloning tournament:', error);
                this.showToast('Error cloning tournament');
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    await toast.present();
  }
}