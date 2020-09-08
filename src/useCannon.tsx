// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/cannon` if it exists or ad... Remove this comment to see the full error message
import * as CANNON from 'cannon'
import React, { useState, useEffect, useContext, useRef } from 'react'
// @ts-expect-error ts-migrate(2305) FIXME: Module '"../node_modules/react-three-fiber/targets... Remove this comment to see the full error message
import { useRender } from 'react-three-fiber'

// Cannon-world context provider
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
const context = React.createContext()
export function Provider({
  children
}: any) {
  // Set up physics
  const [world] = useState(() => new CANNON.World())
  useEffect(() => {
    world.broadphase = new CANNON.NaiveBroadphase()
    world.solver.iterations = 10
    world.gravity.set(0, 0, -25)  // 重力設定
  }, [world])

  // Run world stepper every frame
  useRender(() => world.step(1 / 60))
  // Distribute world via context
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  return <context.Provider value={world} children={children} />
}

// Custom hook to maintain a world physics body
export function useCannon({ ...props }, fn: any, deps = []) {
  const ref = useRef()
  // Get cannon world object
  const world = useContext(context)
  // Instanciate a physics body
  const [body] = useState(() => new CANNON.Body(props))
  useEffect(() => {
    // Call function so the user can add shapes
    fn(body)
    // Add body to world on mount
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    world.addBody(body)
    // Remove body on unmount
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    return () => world.removeBody(body)
  }, [body, fn, world])

  useRender(() => {
    if (ref.current) {
      // Transport cannon physics into the referenced threejs object
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      ref.current.position.copy(body.position)
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      ref.current.quaternion.copy(body.quaternion)
    }
  })

  return ref
}