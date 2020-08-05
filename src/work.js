/** @jsx jsx */
import * as THREE from 'three';
import * as CANNON from 'cannon';
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, apply, useFrame, extend, useThree,} from 'react-three-fiber';
import { css, jsx } from '@emotion/core';
import { useCannon, Provider } from './useCannon';

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

  export const Work = () => (
    <div css={theme}>
      <Canvas>
        <CameraControls />
        <ambientLight intensity={0.5} />
        <spotLight
          intensity={0.6}
          position={[30, 30, 50]}
          angle={0.2}
          penumbra={1}
          castShadow
        />
        <Plane rotation={[-0.5 * Math.PI, 0, 0]} position={[0, -5, 0]} />
        <Model />
      </Canvas>
  </div>
  )