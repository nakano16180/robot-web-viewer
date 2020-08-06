import * as THREE from "three"
import React, { Suspense, useRef, useState } from "react"
import { useLoader, useFrame, extend, useThree} from "react-three-fiber"

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import URDFLoader from 'urdf-loader';

//import customElementToReact from '@nrk/custom-element-to-react'
//import URDFViewer from './urdf-viewer-element';

//const RobotViewer = customElementToReact(URDFViewer, {
//  props: ['package', 'urdf', 'up', 'display-shadow', 'ambient-color', 'ignore-limits']
//});


const LoadModel = () => {
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
  console.log(robot);
  return (
    <primitive object={robot[0]} dispose={null} />
  )
}

export const Model = () => {
  return (
    <mesh>
      <LoadModel />
    </mesh>
  )
}