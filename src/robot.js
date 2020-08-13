import * as THREE from "three"
import React, { Suspense, useRef, useState } from "react"
import { useLoader, useFrame, extend, useThree} from "react-three-fiber"

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import URDFLoader from 'urdf-loader';

const LoadModel = () => {
  // loading robot model from urdf
  const robot = useLoader(URDFLoader, '/urdf/open_manipulator.URDF', loader => { 
    loader.loadMeshFunc = (path, manager, done) => {
      const ext = path.split(/\./g).pop().toLowerCase();
      switch (ext) {
        case 'dae':
          new ColladaLoader(manager).load(
            path,
            result => done(result.scene),
            null,
            err => done(null, err)
          );
          break;
        case 'stl':
          new STLLoader(manager).load(
            path,
            result => {
              const material = new THREE.MeshPhongMaterial();
              const mesh = new THREE.Mesh(result, material);
              done(mesh);
            },
            null,
            err => done(null, err)
          );
          break;
      }
    };
    loader.fetchOptions = { mode: 'cors', credentials: 'same-origin' };
  });
  //console.log(robot);
  return (
    <group rotation={[-0.5 * Math.PI, 0, 0]}>
      <primitive object={robot[0]} dispose={null} />
    </group>
  )
}

export const Model = () => {
  return (
    <mesh>
      <LoadModel />
    </mesh>
  )
}