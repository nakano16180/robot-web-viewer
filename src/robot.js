import * as THREE from "three"
import React, { Suspense, useRef, useState } from "react"
import { useLoader, useFrame, extend, useThree} from "react-three-fiber"

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import URDFLoader from 'urdf-loader';

/*
Reference coordinate frames for THREE.js and ROS.
Both coordinate systems are right handed so the URDF is instantiated without
frame transforms. The resulting model can be rotated to rectify the proper up,
right, and forward directions

THREE.js
   Y
   |
   |
   .-----X
 ／
Z

   Z
   |   Y
   | ／
   .-----X

ROS URDf
       Z
       |   X
       | ／
 Y-----.

*/

const LoadModel = () => {
  // loading robot model from urdf
  // https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{filepath}
  const robot = useLoader(URDFLoader, 'https://raw.githubusercontent.com/nakano16180/robot-web-viewer/master/public/urdf/open_manipulator.URDF', loader => { 
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
    loader.fetchOptions = { headers: {'Accept': 'application/vnd.github.v3.raw'}};
  });
  //console.log(robot);
  return (
    <group position={[0, 0, 0]} rotation={[-0.5 * Math.PI, 0, Math.PI]} scale={[10, 10, 10]}>
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