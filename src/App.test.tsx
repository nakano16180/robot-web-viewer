import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
test('renders learn react link', () => {
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  const { getByText } = render(<App />);
  const linkElement = getByText(/learn react/i);
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
  expect(linkElement).toBeInTheDocument();
});
