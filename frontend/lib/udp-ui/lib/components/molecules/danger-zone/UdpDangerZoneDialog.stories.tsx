import DangerZoneDialog from './UdpDangerZoneDialog';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Molecules/Form/DangerZone',
  component: DangerZoneDialog,
  parameters: {},
  tags: ['autodocs'],
} satisfies Meta<typeof DangerZoneDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    deleteCallback: () => Promise.resolve(),
    headlineText: 'Hier können Sie die Ressource "Dingsbums" löschen.',
    explainerText:
      'Alle Daten, die in dem Projekt enthalten sind, werden dauerhaft gelöscht! Diese Aktion kann nicht rückgängig gemacht werden!',
    labelText:
      'Geben Sie hier zur Bestätigung den Namen der Ressource ein, die Sie löschen wollen.',
    resourceName: 'Dingsbums',
    className: 'max-w-[500px]',
  },
};
