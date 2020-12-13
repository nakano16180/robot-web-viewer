/** @jsxRuntime classic */
/** @jsx jsx */
import * as THREE from "three";
import React, { useRef, Suspense } from "react";
import { Canvas, useLoader, useThree } from "react-three-fiber";
import { css, jsx } from "@emotion/react";
import { a } from "@react-spring/three";

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import URDFLoader from "urdf-loader";

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

const LoadModel = ({ filepath }) => {
  const [hovered, setHovered] = React.useState(null);
  const { camera, gl } = useThree();

  // loading robot model from urdf
  // https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{filepath}
  const ref = useRef();
  const robot = useLoader(URDFLoader, filepath, loader => {
    loader.loadMeshFunc = (path, manager, done) => {
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
    };
    loader.fetchOptions = {
      headers: { Accept: "application/vnd.github.v3.raw" }
    };
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

  // get URDFJoint
  //const robotJoints = useMemo(() => Object.keys(robot.joints).map(jointName => robot.joints[jointName].setAngle(robot.joints[jointName].angle)), [robot] )
  //const robotJoints = useMemo(() => Object.keys(robot.joints).map(jointName => robot.joints[jointName]), [robot] )
  //console.log(robotJoints);

  return (
    <a.mesh
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
    </a.mesh>
  );
};

export const Work = () => {
  //console.log(props);
  //console.log(props.qs);  // querystring
  var modelpath =
    "https://raw.githubusercontent.com/nakano16180/robot-web-viewer/master/public/urdf/open_manipulator.URDF";

  return (
    <div css={theme}>
      <Canvas camera={{ position: [0, 5, 10] }}>
        <hemisphereLight
          skyColor={"#455A64"}
          groundColor={"#000"}
          intensity={0.5}
          position={[0, 1, 0]}
        />
        <directionalLight
          color={0xffffff}
          position={[4, 10, 1]}
          shadowMapWidth={2048}
          shadowMapHeight={2048}
          castShadow
        />
        <Suspense fallback={null}>
          <LoadModel filepath={modelpath} />
          <OrbitControls />
        </Suspense>
        <gridHelper args={[0, 0, 0]} />
        <axesHelper />
      </Canvas>
    </div>
  );
};
