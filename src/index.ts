import {
  ViewerApp,
  AssetManagerPlugin,
  GBufferPlugin,
  ProgressivePlugin,
  TonemapPlugin,
  SSRPlugin,
  SSAOPlugin,
  BloomPlugin,
  GammaCorrectionPlugin,
  ITexture,
  TweakpaneUiPlugin,
  AssetManagerBasicPopupPlugin,
  CanvasSnipperPlugin,
  IViewerPlugin,
  CameraController,
  MeshStandardMaterial2,
  Color,
  mobileAndTabletCheck,

  // Color, // Import THREE.js internals
  // Texture, // Import THREE.js internals
} from "webgi"
import "./styles.css"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

async function setupViewer() {
  // Initialize the viewer
  const viewer = new ViewerApp({
    canvas: document.getElementById("webgi-canvas") as HTMLCanvasElement,
    useRgbm: false,
    // isAntialiased: true,
  })

  const isMobile = mobileAndTabletCheck()

  // Add some plugins
  const manager = await viewer.addPlugin(AssetManagerPlugin)
  const camera = viewer.scene.activeCamera
  const position = camera.position
  const target = camera.target

  // Add a popup(in HTML) with download progress when any asset is downloading.
  await viewer.addPlugin(AssetManagerBasicPopupPlugin)

  // Add plugins individually.
  await viewer.addPlugin(GBufferPlugin)
  await viewer.addPlugin(new ProgressivePlugin(32))
  await viewer.addPlugin(new TonemapPlugin(!viewer.useRgbm))
  await viewer.addPlugin(GammaCorrectionPlugin)
  await viewer.addPlugin(SSRPlugin)
  await viewer.addPlugin(SSAOPlugin)
  // await viewer.addPlugin(DiamondPlugin)
  // await viewer.addPlugin(FrameFadePlugin)
  // await viewer.addPlugin(GLTFAnimationPlugin)
  // await viewer.addPlugin(GroundPlugin)
  await viewer.addPlugin(BloomPlugin)

  // or use this to add all main ones at once.
  //   await addBasePlugins(viewer)

  // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
  await viewer.addPlugin(CanvasSnipperPlugin)

  viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false })

  // This must be called once after all plugins are added.
  viewer.renderer.refreshPipeline()

  // Import and add a GLB file.
  await viewer.load("./assets/drill.glb")

  const drillMaterial = manager.materials!.findMaterialsByName(
    "Drill_01"
  )[0] as MeshStandardMaterial2

  if (isMobile) {
    position.set(-3.5, -1.1, 5.5)
    target.set(-0.8, 1.55, -0.7)
    camera.setCameraOptions({ fov: 40 })
  }

  // Load an environment map if not set in the glb file

  // Add some UI for tweak and testing.
  //   const uiPlugin = await viewer.addPlugin(TweakpaneUiPlugin)
  // Add plugins to the UI to see their settings.
  //   uiPlugin.setupPlugins<IViewerPlugin>(TonemapPlugin, CanvasSnipperPlugin)

  //scroll animation
  const setupScrollAnimation = () => {
    const tl = gsap.timeline()

    //first Section
    tl.to(position, {
      x: isMobile ? -6.0 : 1.56,
      y: isMobile ? 5.5 : -2.26,
      z: isMobile ? -3.3 : -3.25,
      scrollTrigger: {
        trigger: ".second",
        // markers: true,
        start: "top bottom",
        end: "top top",
        scrub: true,
        immediateRender: false,
      },
      onUpdate,
    })
      .to(target, {
        x: isMobile ? -1.1 : -1.37,
        y: isMobile ? 1.0 : 1.99,
        z: isMobile ? -0.1 : -0.37,
        scrollTrigger: {
          trigger: ".second",
          // markers: true,
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })
      .to(".hero", {
        xPercent: "-150",
        opacity: 0,
        scrollTrigger: {
          trigger: ".second",
          start: "top bottom",
          end: "top 80%",
          scrub: true,
          immediateRender: false,
        },
      })

      //last section
      .to(position, {
        x: -3.63,
        y: -0.6492,
        z: 2.6,
        scrollTrigger: {
          trigger: ".third",
          //   markers: true,
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
        onUpdate,
      })
      .to(target, {
        x: -1.42,
        y: 0.9,
        z: -0.06,
        scrollTrigger: {
          trigger: ".third",
          //   markers: true,
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })
  }

  // gsap.delayedCall(0.01, () =>
  //   ScrollTrigger.getAll().forEach((t) =>
  //     console.log("start", t.start, "end", t.end)
  //   )
  // )

  //webgi update
  let needsUpdate = true

  const onUpdate = () => {
    needsUpdate = true
    // viewer.renderer.resetShadows()
    viewer.setDirty()
  }

  viewer.addEventListener("preFrame", () => {
    if (needsUpdate) {
      camera.positionTargetUpdated(true)
      needsUpdate = false
    }
  })

  /**
   * Know more event */
  //buttons
  const heroBtn = document.querySelector(".hero-btn") as HTMLElement
  const backToTopBtn = document.querySelector(".back_to_top-btn") as HTMLElement
  const customize = document.querySelector(".customise-btn") as HTMLElement
  const exitBtn = document.querySelector(".button-exit") as HTMLElement

  //color switch btns
  const yellow = document.querySelector(".yellow") as HTMLElement
  const white = document.querySelector(".white") as HTMLElement
  const black = document.querySelector(".black") as HTMLElement

  //pages
  const secondPage = document.querySelector(".second")
  const colorPicker = document.querySelector(
    ".customizer-container"
  ) as HTMLElement
  const main_container = document.querySelector(
    ".main-container"
  ) as HTMLElement
  const canvasContainer = document.getElementById(
    "webgi-canvas-container"
  ) as HTMLElement

  heroBtn?.addEventListener("click", () => {
    window.scrollTo({
      top: secondPage?.getBoundingClientRect().top,
      left: 0,
      behavior: "smooth",
    })
  })

  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  })

  const enableControllers = () => {
    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: true })
    exitBtn.style.visibility = "visible"
    colorPicker.style.visibility = "visible"
  }
  customize?.addEventListener("click", () => {
    main_container.style.visibility = "hidden"
    canvasContainer.style.pointerEvents = "all"
    document.body.style.cursor = "grab"

    gsap.to(position, {
      x: -3.47,
      y: 1.113,
      z: -8.97,
      duration: 2,
      ease: "power3.inOut",
      onUpdate,
    })
    gsap.to(target, {
      x: 0.45,
      y: 0.127,
      z: 0.5996,
      duration: 2,
      ease: "power3.inOut",
      onUpdate,
      onComplete: enableControllers,
    })
  })

  exitBtn?.addEventListener("click", () => {
    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false })
    main_container.style.visibility = "visible"
    colorPicker.style.visibility = "hidden"
    canvasContainer.style.pointerEvents = "none"
    document.body.style.cursor = "default"
    exitBtn.style.visibility = "hidden"

    gsap.to(position, {
      x: -3.63,
      y: -0.6492,
      z: 2.6,
      duration: 1,
      ease: "power3.inOut",
      onUpdate,
    })
    gsap.to(target, {
      x: -1.42,
      y: 0.9,
      z: -0.06,
      duration: 1,
      ease: "power3.inOut",
      onUpdate,
    })
  })

  // switch colors
  const changeColor = (_colorToBeChanged: Color) => {
    drillMaterial.color = _colorToBeChanged
    viewer.scene.setDirty()
  }

  yellow.addEventListener("click", () => {
    changeColor(new Color(0xffffff).convertSRGBToLinear())
  })

  white.addEventListener("click", () => {
    changeColor(new Color(0x21b350).convertSRGBToLinear())
  })

  black.addEventListener("click", () => {
    changeColor(new Color(0xd30e9d).convertSRGBToLinear())
  })

  setupScrollAnimation()
}

setupViewer()
