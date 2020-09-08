/** @jsx jsx */
import { css, jsx, Global } from '@emotion/core';
import emotionReset from 'emotion-reset';
// @ts-expect-error ts-migrate(6142) FIXME: Module './work' was resolved to '/home/kaito/works... Remove this comment to see the full error message
import { Work } from './work';

const globalStyles = css`
    ${emotionReset}
    *, *::after, *::before {
        box-sizing: border-box;
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
        font-smoothing: antialiased;
    }
`;

const App = ({ ...props }) => {
  return (
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'div'.
    <div>
      // @ts-expect-error ts-migrate(2749) FIXME: 'Global' refers to a value, but is being used as a... Remove this comment to see the full error message
      <Global styles={globalStyles} />
      <Work { ...props}/>
    </div>
  );
};

export default App;