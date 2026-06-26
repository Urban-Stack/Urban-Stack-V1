import { Menu } from '@lumino/widgets';
import { IMainMenu } from '@jupyterlab/mainmenu';

const plugin = {
	id: 'legal-links:plugin',
	autoStart: true,
	requires: [IMainMenu],
	activate: (app, mainMenu) => {
		console.log('Legal links extension activated');

		const { commands } = app;

		commands.addCommand('legal:impressum', {
			label: 'Impressum',
			execute: () => window.open('https://urbanstack.de/impressum', '_blank')
		});

		commands.addCommand('legal:datenschutz', {
			label: 'Datenschutz',
			execute: () => window.open('https://urbanstack.de/datenschutz', '_blank')
		});

		const legalMenu = new Menu({ commands });
		legalMenu.title.label = 'Impressum + Datenschutz';
		legalMenu.addItem({ command: 'legal:impressum' });
		legalMenu.addItem({ command: 'legal:datenschutz' });

		mainMenu.addMenu(legalMenu, { rank: 1000 });
	}
};

export default [plugin];
