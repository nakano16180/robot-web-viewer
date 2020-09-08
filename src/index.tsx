import React from 'react';
import ReactDOM from 'react-dom';
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/react-router-dom` if it ex... Remove this comment to see the full error message
import { BrowserRouter as Router, Route} from "react-router-dom";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/query-string` if it exists... Remove this comment to see the full error message
import queryString from 'query-string';
// import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  <React.StrictMode>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <Router>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Route render={ (props: any) => <App qs={queryString.parse(props.location.search)} />
      }/>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
