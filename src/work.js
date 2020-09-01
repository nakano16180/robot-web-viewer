/** @jsx jsx */
import * as THREE from 'three';
import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useLoader, useThree, useFrame,} from 'react-three-fiber';
import { css, jsx } from '@emotion/core';

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import URDFLoader from 'urdf-loader';

import { OrbitControls, TransformControls } from 'drei'
import { Controls, useControl } from "react-three-gui"

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

const GetAngles = (robot) => {
  const angles = {};
  if (robot) {
      for (const name in robot.joints) angles[name] = robot.joints[name].angle;
  }

  return angles;
}

const isJoint = j => {
  return j.isURDFJoint && j.jointType !== 'fixed';
};

const LoadModel = ({ filepath }) => {
  // The highlight material
  const highlightMaterial =
    new THREE.MeshPhongMaterial({
        shininess: 10,
        color: '#FFFFFF',
        emissive: '#FFFFFF',
        emissiveIntensity: 0.25,
    });

  // Highlight the link geometry under a joint
  const highlightLinkGeometry = (m, revert) => {
    const traverse = c => {
      // Set or revert the highlight color
      if (c.type === 'Mesh') {
        if (revert) {
          c.material = c.__origMaterial;
          delete c.__origMaterial;
        } else {
          c.__origMaterial = c.material;
          c.material = highlightMaterial;
        }
      }

      // Look into the children and stop if the next child is
      // another joint
      if (c === m || !isJoint(c)) {
        for (let i = 0; i < c.children.length; i++) {
          traverse(c.children[i]);
        }
      }
    };
    traverse(m);
  };

  // loading robot model from urdf
  // https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{filepath}
  const ref = useRef()
  const robot = useLoader(URDFLoader, filepath, loader => { 
    loader.loadMeshFunc = (path, manager, done) => {
      const ext = path.split(/\./g).pop().toLowerCase();
      switch (ext) {
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
  // get URDFJoint
  //const robotJoints = useMemo(() => Object.keys(robot.joints).map(jointName => robot.joints[jointName].setAngle(robot.joints[jointName].angle)), [robot] )
  const robotJoints = useMemo(() => Object.keys(robot.joints).map(jointName => robot.joints[jointName]), [robot] )
  console.log(robotJoints);

  /*
  Object.keys(robot.joints)
    .sort((a, b) => {
      const da = a.split(/[^\d]+/g).filter(v => !!v).pop();
      const db = b.split(/[^\d]+/g).filter(v => !!v).pop();

      if (da !== undefined && db !== undefined) {
        const delta = parseFloat(da) - parseFloat(db);
        if (delta !== 0) return delta;
      }

      if (a > b) return 1;
      if (b > a) return -1;
      return 0;
    })
    .map(key => robot.joints[key])
    .forEach(joint => {
      var angle = useControl(joint.name, {type: 'number', spring: true});
      robot.setAngle(joint.name, angle);
    })
  */

  //useFrame(()=>{console.log(ref.current)})

  return (
    <primitive 
      ref={ref} 
      object={robot} 
      position={[0, 0, 0]} 
      rotation={[-0.5 * Math.PI, 0, Math.PI]} 
      scale={[10, 10, 10]} 
      dispose={null} 
      onPointerOver={(e) => highlightLinkGeometry(e.object, false)}
      onPointerOut={(e) => highlightLinkGeometry(e.object, true)}
    />
    //<group>
    //  {robotJoints.map(joint => (
    //    <primitive object={joint} rotation={[-0.5 * Math.PI, 0, Math.PI]} scale={[10, 10, 10]} dispose={null} />
    //  ))}
    //</group>
  )
}

export const Work = ({ ...props }) => {
  //console.log(props);
  //console.log(props.qs);  // querystring
  var modelpath = 'https://raw.githubusercontent.com/nakano16180/robot-web-viewer/master/public/urdf/open_manipulator.URDF';
  if(props.qs.filepath){
    modelpath = props.qs.filepath;
  }
  const orbit = useRef();
  const transform = useRef();
  const mode = useControl("mode", { type: "select", items: ["scale", "rotate", "translate"] });
  useEffect(() => {
    if (transform.current) {
      const controls = transform.current
      controls.setMode(mode)
      const callback = event => (orbit.current.enabled = !event.value)
      controls.addEventListener("dragging-changed", callback)
      return () => controls.removeEventListener("dragging-changed", callback)
    }
  });

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
        <Suspense fallback={null}>
          <TransformControls ref={transform} mode={mode}>
            <LoadModel filepath={modelpath} />
          </TransformControls>
          <OrbitControls ref={orbit} />
        </Suspense>
        <gridHelper args={[0, 0, 0]} />
        <axesHelper />
      </Canvas>
      <Controls />
    </div>
  )
};