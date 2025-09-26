import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  // The app header contains the app name 'Hands of Hope Shipping'
  const header = screen.getByText(/hands of hope shipping/i);
  expect(header).toBeDefined();
});
