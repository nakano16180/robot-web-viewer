/** @jsx jsx */
import * as THREE from "three";
import React, { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useLoader, useThree, useFrame } from "react-three-fiber";
import { css, jsx } from "@emotion/core";
import { a } from "@react-spring/three";

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/urdf-loader` if it exists ... Remove this comment to see the full error message
import URDFLoader from "urdf-loader";

import { OrbitControls, TransformControls } from "drei";
import { Controls, useControl } from "react-three-gui";

const theme = css`
  width: 100vw;
  height: 100vh;
  background-color: #272727;
`;

const Plane = ({ ...props }) => {
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <mesh {...props} receiveShadow>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <planeBufferGeometry attach="geometry" args={[10, 10]} />
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <meshPhongMaterial attach="material" color="lightpink" />
    </mesh>
  );
};

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const toMouseCoord = (el: any, e: any, v: any) => {
  v.x = ((e.pageX - el.offsetLeft) / el.offsetWidth) * 2 - 1;
  v.y = -((e.pageY - el.offsetTop) / el.offsetHeight) * 2 + 1;
};

// Get which part of the robot is hit by the mouse click
const getCollisions = (camera: any, robot: any, mouse: any) => {
  if (!robot) return [];

  raycaster.setFromCamera(mouse, camera);

  const meshes: any = [];
  robot.traverse((c: any) => c.type === "Mesh" && meshes.push(c));

  return raycaster.intersectObjects(meshes);
};

const isJoint = (j: any) => {
  return j.isURDFJoint && j.jointType !== "fixed";
};

// Find the nearest parent that is a joint
const findNearestJoint = (m: any) => {
  let curr = m;
  while (curr) {
    if (isJoint(curr)) {
      break;
    }
    curr = curr.parent;
  }
  return curr;
};

const LoadModel = ({
  filepath
}: any) => {
  const [hovered, setHovered] = React.useState(null);
  const { camera, gl } = useThree();
  const posX = useControl("Pos X", { type: "number", spring: true });
  const posY = useControl("Pos Y", { type: "number", spring: true });
  const posZ = useControl("Pos Z", { type: "number", spring: true });

  // loading robot model from urdf
  // https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{filepath}
  const ref = useRef();
  const robot = useLoader(URDFLoader, filepath, loader => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loadMeshFunc' does not exist on type 'Lo... Remove this comment to see the full error message
    loader.loadMeshFunc = (path: any, manager: any, done: any) => {
      const ext = path
        .split(/\./g)
        .pop()
        .toLowerCase();
      switch (ext) {
        case "stl":
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
    loader.fetchOptions = {
      headers: { Accept: "application/vnd.github.v3.raw" }
    };
  });
  let robotJointName = [];
  // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
  robotJointName = useMemo(() => Object.keys(robot.joints), [robot]);

  let jointName = useControl("jointName", {
    type: "select",
    items: robotJointName
  });
  let jointAngle = useControl("jointAngle", {
    type: "number",
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    value: robot.joints[jointName].angle,
    min: -6.28,
    max: 6.28,
    onChange: e => {
      // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
      robot.joints[jointName].setAngle(e);
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
  const highlightLinkGeometry = (m: any, revert: any) => {
    const traverse = (c: any) => {
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

  const onMouseMove = (event: any) => {
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
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <a.mesh
      position-x={posX}
      position-y={posY}
      position-z={posZ}
      rotation={[-0.5 * Math.PI, 0, Math.PI]}
      scale={[10, 10, 10]}
    >
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <primitive
        ref={ref}
        object={robot}
        dispose={null}
        onPointerMove={(e: any) => onMouseMove(e)}
        //onPointerOver={(e) => highlightLinkGeometry(e.object, false)}
        onPointerOut={(e: any) => {
          if (hovered) {
            highlightLinkGeometry(hovered, true);
            setHovered(null);
          }
        }}
      />
    </a.mesh>
  );
};

export const Work = ({ ...props }) => {
  //console.log(props);
  //console.log(props.qs);  // querystring
  var modelpath =
    "https://raw.githubusercontent.com/nakano16180/robot-web-viewer/master/public/urdf/open_manipulator.URDF";
  if (props.qs.filepath) {
    modelpath = props.qs.filepath;
  }
  const orbit = useRef();
  const transform = useRef();
  const mode = useControl("mode", {
    type: "select",
    items: ["translate", "rotate"]
  });
  useEffect(() => {
    if (transform.current) {
      const controls = transform.current;
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      controls.setMode(mode);
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      const callback = (event: any) => orbit.current.enabled = !event.value;
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      controls.addEventListener("dragging-changed", callback);
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      return () => controls.removeEventListener("dragging-changed", callback);
    }
  });

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div css={theme}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Canvas camera={{ position: [0, 5, 10] }}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <hemisphereLight
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'Color | u... Remove this comment to see the full error message
          skyColor={"#455A64"}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'Color | u... Remove this comment to see the full error message
          groundColor={"#000"}
          intensity={0.5}
          position={[0, 1, 0]}
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <directionalLight
          color={0xffffff}
          position={[4, 10, 1]}
          shadowMapWidth={2048}
          shadowMapHeight={2048}
          castShadow
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Plane rotation={[-0.5 * Math.PI, 0, 0]} position={[0, 0, 0]} />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Suspense fallback={null}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <TransformControls ref={transform} mode={mode}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <LoadModel filepath={modelpath} />
          </TransformControls>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <OrbitControls ref={orbit} />
        </Suspense>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <gridHelper args={[0, 0, 0]} />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <axesHelper />
      </Canvas>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Controls />
    </div>
  );
};
