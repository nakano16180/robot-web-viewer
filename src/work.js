/** @jsx jsx */
import * as THREE from 'three';
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, apply, useFrame, extend, useThree,} from 'react-three-fiber';
import { css, jsx } from '@emotion/core';

import { Model } from './robot';
import { OrbitControls } from 'drei'

const theme = css`
    width: 100vw;
    height: 100vh;
    background-color: #272727;
`;

const Plane = ({ ...props }) => {
  return (
    <mesh {...props} receiveShadow>
      <planeBufferGeometry attach='geometry' args={[10, 10]} />
      <meshPhongMaterial attach='material' color='lightpink' />
    </mesh>
  );
};

const Box = ({ position, args }) => {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry attach='geometry' args={args} />
      <meshStandardMaterial attach='material' />
    </mesh>
  );
};

export const Work = ({ ...props }) => {
  //console.log(props);
  //console.log(props.qs);  // querystring
  return (
    <div css={theme}>
      <Canvas camera={{ position: [0, 5, 10] }}>
        <hemisphereLight skyColor={'#455A64'} groundColor={'#000'} intensity={0.5} position={[0, 1, 0]} />
        <directionalLight
          color={0xffffff}
          position={[4, 10, 1]}
          shadowMapWidth={2048}
          shadowMapHeight={2048}
          castShadow
        />
        <Plane rotation={[-0.5 * Math.PI, 0, 0]} position={[0, 0, 0]} />
        <OrbitControls />
        {(() => {
          if(props.qs.filepath){
            return (
              <Suspense fallback={null}>
                <Model model={props.qs.filepath}/>
              </Suspense>
            );
          }
        })()}
        <gridHelper args={[0, 0, 0]} />
        <axesHelper />
      </Canvas>
    </div>
  )
};