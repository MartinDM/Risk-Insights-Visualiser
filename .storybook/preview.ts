import type { Preview } from '@storybook/react';

import '../src/styles/tailwind.css'; // or wherever your tailwind/shadcn styles live
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'todo' },
  },
};
export default preview;
