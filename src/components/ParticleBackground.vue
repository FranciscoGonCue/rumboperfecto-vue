<template>
  <div
    class="pointer-events-none fixed inset-0 z-0 h-full w-full transition-colors duration-300"
    :class="isDark ? 'bg-black' : 'bg-white'"
  >
    <canvas id="canvas" ref="canvasRef" class="w-full h-full block" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Color,
  DodecahedronBufferGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  Object3D,
  PointLight,
  Scene,
  Vector2,
  Vector3,
  AmbientLight,
  MeshPhongMaterial,
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import useThree from '@/composables/useThree'
import chroma from 'chroma-js'

const props = defineProps<{
  isDark: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

let three: any = null
let scene: Scene | null = null
let composer: EffectComposer | undefined
let iMesh: InstancedMesh | null = null
let pointLight: PointLight
let animationId: number

let cscale = chroma.scale(['#ff7043', '#ff5722', '#ff6f3c'])

const NUM_INSTANCES = 5000
const instances: Array<any> = []

const target = new Vector3()
const dummy = new Object3D()
const dummyV = new Vector3()

const { randFloat: rnd, randFloatSpread: rndFS } = MathUtils

function initScene() {
  console.log('🎨 Creando escena...')
  scene = new Scene()
  
  // Luces
  const ambientLight = new AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)
  
  pointLight = new PointLight(0xffa000, 4, 1000)
  pointLight.position.set(0, 0, 100)
  scene.add(pointLight)
  console.log('✅ Luces añadidas')

  const geometry = new DodecahedronBufferGeometry(2.5)
  console.log('✅ Geometría creada')
  
  const material = new MeshPhongMaterial({
    color: 0xff7043,
    flatShading: true,
    shininess: 30,
  })
  console.log('✅ Material creado')
  
  iMesh = new InstancedMesh(geometry, material, NUM_INSTANCES)
  scene.add(iMesh)
  console.log('✅ InstancedMesh creado y añadido a la escena')

  for (let i = 0; i < NUM_INSTANCES; i++) {
    instances.push({
      position: new Vector3(rndFS(200), rndFS(200), rndFS(200)),
      scale: rnd(0.1, 0.5),
      velocity: new Vector3(rndFS(3), rndFS(3), rndFS(3)),
      attraction: 0.005 + rnd(0, 0.015),
      vlimit: 0.6 + rnd(0, 0.4),
    })
  }

  for (let i = 0; i < NUM_INSTANCES; i++) {
    const { position, scale } = instances[i]
    dummy.position.copy(position)
    dummy.scale.set(scale, scale, scale)
    dummy.updateMatrix()
    iMesh.setMatrixAt(i, dummy.matrix)
  }
  iMesh.instanceMatrix.needsUpdate = true
  console.log('✅ Instancias inicializadas:', NUM_INSTANCES)

  setTimeout(() => {
    console.log('🎨 Añadiendo colores naranjas...')
    iMesh!.material = new MeshPhongMaterial({
      vertexColors: true,
      flatShading: true,
      shininess: 30,
    })
    updateColors()
  }, 1000)
}

function updateColors() {
  if (!iMesh) return
  const colors = []
  for (let i = 0; i < NUM_INSTANCES; i++) {
    const color = new Color(cscale(rnd(0, 1)).hex())
    colors.push(color.r, color.g, color.b)
  }
  iMesh.geometry.setAttribute(
    'color',
    new InstancedBufferAttribute(new Float32Array(colors), 3)
  )
  console.log('✅ Colores actualizados')
}

function initPostprocessing() {
  console.log('📦 Inicializando post-procesamiento...')
  composer = new EffectComposer(three.renderer)

  const renderPass = new RenderPass(scene!, three.camera)
  composer.addPass(renderPass)

  const bloomPass = new UnrealBloomPass(
    new Vector2(three.size.width, three.size.height),
    0.5,
    0,
    0
  )
  composer.addPass(bloomPass)

  const aaPass = new ShaderPass(FXAAShader)
  composer.addPass(aaPass)
  aaPass.material.uniforms.resolution.value.set(
    1 / three.size.width,
    1 / three.size.height
  )

  three.onAfterResize(() => {
    composer?.setSize(three.size.width, three.size.height)
    aaPass.material.uniforms.resolution.value.set(
      1 / three.size.width,
      1 / three.size.height
    )
  })
  
  console.log('✅ Post-procesamiento configurado')
}

function animate() {
  animationId = requestAnimationFrame(animate)

  if (!three || !scene || !iMesh || !composer) return

  target.copy(three.mouseV3)
  pointLight.position.copy(target)

  for (let i = 0; i < NUM_INSTANCES; i++) {
    const { position, scale, velocity, attraction, vlimit } = instances[i]

    dummyV.copy(target).sub(position).normalize().multiplyScalar(attraction)
    velocity.add(dummyV).clampScalar(-vlimit, vlimit)
    position.add(velocity)

    dummy.position.copy(position)
    dummy.scale.set(scale, scale, scale)
    dummy.lookAt(dummyV.copy(position).add(velocity))
    dummy.updateMatrix()
    iMesh.setMatrixAt(i, dummy.matrix)
  }
  iMesh.instanceMatrix.needsUpdate = true

  try {
    composer.render()
  } catch (e) {
    console.error('[ParticleBackground] render', e)
  }
}

function init() {
  console.log('🎬 Iniciando aplicación...')
  
  if (!canvasRef.value) {
    console.error('❌ Canvas no encontrado')
    return
  }

  console.log('✅ Canvas encontrado:', canvasRef.value)

  try {
    three = useThree().init({
      canvas: canvasRef.value,
      antialias: false,
      mouse_move: true,
      mouse_raycast: true,
      camera_ctrl: false,
      camera_fov: 50,
      camera_pos: new Vector3(0, 0, 250),
    })

    console.log('✅ Three.js inicializado:', three)

    // Establecer el color de fondo correcto según el tema
    three.renderer.setClearColor(props.isDark ? 0x000000 : 0xffffff, 1)

    initScene()
    console.log('✅ Escena inicializada')
    
    initPostprocessing()
    console.log('✅ Post-procesamiento inicializado')
    
    three.renderer.render(scene, three.camera)
    console.log('✅ Primera renderización completada')
    
    animate()
    console.log('🎉 Animación iniciada')
  } catch (error) {
    console.error('❌ Error en init:', error)
  }
}

onMounted(() => {
  console.log('🔧 Componente montado')
  setTimeout(() => {
    init()
  }, 100)
})

// Watch para cambiar el color de fondo cuando cambie el tema
watch(() => props.isDark, (isDark) => {
  if (three && three.renderer) {
    three.renderer.setClearColor(isDark ? 0x000000 : 0xffffff, 1)
    console.log('🎨 Fondo cambiado a:', isDark ? 'negro' : 'blanco')
  }
})

onUnmounted(() => {
  console.log('🧹 Limpiando recursos...')
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (three && three.renderer) {
    three.renderer.dispose()
  }
  if (composer) {
    // EffectComposer no tiene dispose en esta versión
    composer.passes.forEach((pass: any) => {
      if (pass.dispose) pass.dispose()
    })
  }
})
</script>

<style scoped>
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
