/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { colors } from '../src/theme/tokens';

test('Pulse Forge tokens are defined', () => {
  expect(colors.ink).toBe('#0B1F1A');
  expect(colors.mint).toBe('#2EE6A6');
});

test('App module loads', async () => {
  const App = require('../App').default;
  expect(App).toBeDefined();
});
