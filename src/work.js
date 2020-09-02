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

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const toMouseCoord = (el, e, v) => {
  v.x = ((e.pageX - el.offsetLeft) / el.offsetWidth) * 2 - 1;
  v.y = -((e.pageY - el.offsetTop) / el.offsetHeight) * 2 + 1;
};

// Get which part of the robot is hit by the mouse click
const getCollisions = (camera, robot, mouse) => {
  if (!robot) return [];

  raycaster.setFromCamera(mouse, camera);

  const meshes = [];
  robot.traverse(c => c.type === 'Mesh' && meshes.push(c));

  return raycaster.intersectObjects(meshes);
};

const isJoint = j => {
  return j.isURDFJoint && j.jointType !== 'fixed';
};

// Find the nearest parent that is a joint
const findNearestJoint = m => {
  let curr = m;
  while (curr) {
      if (isJoint(curr)) {
          break;
      }
      curr = curr.parent;
  }
  return curr;
};

const LoadModel = ({ filepath }) => {
  const [hovered, setHovered] = React.useState(null);
  const { camera, gl } = useThree();
  
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

  const onMouseMove = (event) => {
    toMouseCoord(gl.domElement, event, mouse);
    const collision = getCollisions(camera, robot, mouse).shift() || null;
    const joint = collision && findNearestJoint(collision.object);

    if (joint !== hovered){
      if (hovered){
        //console.log("pointer out");
        highlightLinkGeometry(hovered, true);
        setHovered(null);
      }
      if(joint){
        //console.log("pointer over");
        highlightLinkGeometry(joint, false);
        setHovered(joint);
      }
    }
  }

  // get URDFJoint
  //const robotJoints = useMemo(() => Object.keys(robot.joints).map(jointName => robot.joints[jointName].setAngle(robot.joints[jointName].angle)), [robot] )
  //const robotJoints = useMemo(() => Object.keys(robot.joints).map(jointName => robot.joints[jointName]), [robot] )
  //console.log(robotJoints);

  return (
    <primitive 
      ref={ref} 
      object={robot} 
      position={[0, 0, 0]} 
      rotation={[-0.5 * Math.PI, 0, Math.PI]} 
      scale={[10, 10, 10]} 
      dispose={null} 
      onPointerMove={(e) => onMouseMove(e)}
      //onPointerOver={(e) => highlightLinkGeometry(e.object, false)}
      onPointerOut={(e) => {
        highlightLinkGeometry(hovered, true);
        setHovered(null);
      }}
    />
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