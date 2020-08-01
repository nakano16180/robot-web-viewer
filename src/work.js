/** @jsx jsx */
import { useRef } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import { css, jsx } from '@emotion/core';

const theme = css`
    width: 100vw;
    height: 100vh;
    background-color: #000;
`;

const Thing = () => {
    const ref = useRef();
    useFrame(() => (ref.current.rotation.z += 0.01));
    return (
      <mesh
        ref={ref}
        onClick={e => console.log('click')}
        onPointerOver={e => console.log('hover')}
        onPointerOut={e => console.log('unhover')}
      >
        <planeBufferGeometry attach='geometry' args={[1, 1]} />
        <meshBasicMaterial
          attach='material'
          color='hotpink'
          opacity={0.5}
          transparent
        />
      </mesh>
    );
  };

  export const Work = () => (
    <div css={theme}>
      <Canvas>
        <Thing />
      </Canvas>
  </div>
  )