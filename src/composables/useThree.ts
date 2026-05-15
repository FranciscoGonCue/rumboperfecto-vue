import {
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  Vector2,
  Raycaster,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ThreeConfig {
  canvas: HTMLCanvasElement
  antialias?: boolean
  mouse_move?: boolean
  mouse_raycast?: boolean
  camera_ctrl?: {
    enableDamping?: boolean
    dampingFactor?: number
  } | boolean
  camera_fov?: number
  camera_pos?: Vector3
}

interface ThreeInstance {
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  cameraCtrl?: OrbitControls
  mouseV3: Vector3
  mouse: Vector2
  size: { width: number; height: number }
  raycaster?: Raycaster
  onAfterResize: (callback: () => void) => void
}

export default function useThree() {
  let resizeCallbacks: Array<() => void> = []

  function init(config: ThreeConfig): ThreeInstance {
    const canvas = config.canvas
    const width = window.innerWidth
    const height = window.innerHeight

    const camera = new PerspectiveCamera(
      config.camera_fov || 50,
      width / height,
      0.1,
      10000
    )
    
    if (config.camera_pos) {
      camera.position.copy(config.camera_pos)
    }

    const renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: config.antialias !== undefined ? config.antialias : true,
      alpha: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xffffff, 1)

    const mouse = new Vector2()
    const mouseV3 = new Vector3()
    let raycaster: Raycaster | undefined

    if (config.mouse_raycast) {
      raycaster = new Raycaster()
    }

    if (config.mouse_move) {
      window.addEventListener('mousemove', (event: MouseEvent) => {
        mouse.x = (event.clientX / width) * 2 - 1
        mouse.y = -(event.clientY / height) * 2 + 1

        const vector = new Vector3(mouse.x, mouse.y, 0.5)
        vector.unproject(camera)
        const dir = vector.sub(camera.position).normalize()
        const distance = -camera.position.z / dir.z
        mouseV3.copy(camera.position).add(dir.multiplyScalar(distance))

        if (raycaster) {
          raycaster.setFromCamera(mouse, camera)
        }
      })
    }

    let cameraCtrl: OrbitControls | undefined
    if (config.camera_ctrl) {
      cameraCtrl = new OrbitControls(camera, canvas)
      
      if (typeof config.camera_ctrl === 'object') {
        if (config.camera_ctrl.enableDamping !== undefined) {
          cameraCtrl.enableDamping = config.camera_ctrl.enableDamping
        }
        if (config.camera_ctrl.dampingFactor !== undefined) {
          cameraCtrl.dampingFactor = config.camera_ctrl.dampingFactor
        }
      }
    }

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)

      resizeCallbacks.forEach(callback => callback())
    }

    window.addEventListener('resize', handleResize)

    const instance: ThreeInstance = {
      renderer,
      camera,
      cameraCtrl,
      mouseV3,
      mouse,
      size: { width, height },
      raycaster,
      onAfterResize: (callback: () => void) => {
        resizeCallbacks.push(callback)
      },
    }

    return instance
  }

  return { init }
}
