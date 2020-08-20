/** @jsx jsx */
import * as THREE from 'three';
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, apply, useFrame, extend, useThree,} from 'react-three-fiber';
import { css, jsx } from '@emotion/core';

import { Model } from './robot';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Extend will make OrbitControls available as a JSX element called orbitControls for us to use.
extend({ OrbitControls });

const theme = css`
    width: 100vw;
    height: 100vh;
    background-color: #272727;
`;

const CameraControls = () => {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls component.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls
  const {
    camera,
    gl: { domElement },
  } = useThree();
  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef();
  useFrame((state) => controls.current.update());
  return <orbitControls ref={controls} args={[camera, domElement]} />;
};

const Plane = ({ ...props }) => {
  return (
    <mesh {...props} receiveShadow>
      <planeBufferGeometry attach='geometry' args={[40, 40]} />
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
        <CameraControls />
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