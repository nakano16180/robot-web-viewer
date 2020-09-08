import * as THREE from "three"
import React, { Suspense, useRef, useState } from "react"
import { useLoader, useFrame, extend, useThree} from "react-three-fiber"

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/urdf-loader` if it exists ... Remove this comment to see the full error message
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

const LoadModel = ({
  filepath
}: any) => {
  // loading robot model from urdf
  // https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{filepath}
  const robot = useLoader(URDFLoader, filepath, loader => { 
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loadMeshFunc' does not exist on type 'Lo... Remove this comment to see the full error message
    loader.loadMeshFunc = (path: any, manager: any, done: any) => {
      const ext = path.split(/\./g).pop().toLowerCase();
      switch (ext) {
        case 'dae':
          new ColladaLoader(manager).load(
            path,
            result => done(result.scene),
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
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
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
            null,
            err => done(null, err)
          );
          break;
      }
    };
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'fetchOptions' does not exist on type 'Lo... Remove this comment to see the full error message
    loader.fetchOptions = { headers: {'Accept': 'application/vnd.github.v3.raw'}};
  });
  //console.log(robot);
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <group position={[0, 0, 0]} rotation={[-0.5 * Math.PI, 0, Math.PI]} scale={[10, 10, 10]}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <primitive object={robot[0]} dispose={null} />
    </group>
  )
}

export const Model = ({ ...props }) => {
  console.log(props);
  console.log(props.model);
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <mesh>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <LoadModel filepath={props.model}/>
    </mesh>
  )
}