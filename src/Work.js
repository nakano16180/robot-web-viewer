/** @jsxRuntime classic */
/** @jsx jsx */
import * as THREE from "three";
import React, { useRef, Suspense } from "react";
import { Canvas, useLoader, useThree } from "react-three-fiber";
import { css, jsx } from "@emotion/react";

import {ModelLoader} from "./LoadModel.js";

import { OrbitControls } from "drei";

const theme = css`
  width: 100vw;
  height: 100vh;
  background-color: #272727;
`;

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
  robot.traverse(c => c.type === "Mesh" && meshes.push(c));

  return raycaster.intersectObjects(meshes);
};

const isJoint = j => {
  return j.isURDFJoint && j.jointType !== "fixed";
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

const LoadRobotModel = ({ filepath }) => {
  const [hovered, setHovered] = React.useState(null);
  const { camera, gl } = useThree();

  // loading robot model from urdf
  // https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{filepath}
  const ref = useRef();
  const robot = useLoader(ModelLoader, filepath, loader => {
    loader.rospackCommands = {
      find( pkg ) {
        switch ( pkg ) {
          case 'open_manipulator_description':
            return 'https://raw.githubusercontent.com/ROBOTIS-GIT/open_manipulator/master/open_manipulator_description/';
          default:
            return pkg;
        }
      }
    };
    loader.packages = {
      'open_manipulator_description' : 'https://raw.githubusercontent.com/ROBOTIS-GIT/open_manipulator/master/open_manipulator_description/'
    }
  });

  // The highlight material
  const highlightMaterial = new THREE.MeshPhongMaterial({
    shininess: 10,
    color: "#FFFFFF",
    emissive: "#FFFFFF",
    emissiveIntensity: 0.25
  });

  // Highlight the link geometry under a joint
  const highlightLinkGeometry = (m, revert) => {
    const traverse = c => {
      // Set or revert the highlight color
      if (c.type === "Mesh") {
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

  const onMouseMove = event => {
    toMouseCoord(gl.domElement, event, mouse);
    const collision = getCollisions(camera, robot, mouse).shift() || null;
    const joint = collision && findNearestJoint(collision.object);

    if (joint !== hovered) {
      if (hovered) {
        //console.log("pointer out");
        highlightLinkGeometry(hovered, true);
        setHovered(null);
      }
      if (joint) {
        //console.log("pointer over");
        highlightLinkGeometry(joint, false);
        setHovered(joint);
      }
    }
  };

  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[-0.5 * Math.PI, 0, Math.PI]}
      scale={[10, 10, 10]}
    >
      <primitive
        ref={ref}
        object={robot}
        dispose={null}
        onPointerMove={onMouseMove}
        onPointerOut={() => {
          if (hovered) {
            highlightLinkGeometry(hovered, true);
            setHovered(null);
          }
        }}
      />
    </mesh>
  );
};

export const Work = () => {
  //console.log(props);
  //console.log(props.qs);  // querystring
  var modelpath =
    "https://raw.githubusercontent.com/ROBOTIS-GIT/open_manipulator/master/open_manipulator_description/urdf/open_manipulator_robot.urdf.xacro";

  return (
    <div css={theme}>
      <Canvas camera={{ position: [0, 5, 10] }}>
        <hemisphereLight
          skyColor={"#455A64"}
          groundColor={"#000"}
          intensity={0.5}
          position={[0, 1, 0]}
        />
        <Suspense fallback={null}>
          <LoadRobotModel filepath={modelpath} />
        </Suspense>
        <OrbitControls />
        <gridHelper args={[0, 0, 0]} />
        <axesHelper />
      </Canvas>
    </div>
  );
};
