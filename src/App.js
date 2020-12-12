/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx, Global } from "@emotion/core";
import emotionReset from "emotion-reset";
import { Work } from "./Work";

const globalStyles = css`
  ${emotionReset}
  *, *::after, *::before {
    box-sizing: border-box;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-smoothing: antialiased;
  }
`;

const App = () => {
  return (
    <div>
      <Global styles={globalStyles} />
      <Work />
    </div>
  );
};

export default App;
