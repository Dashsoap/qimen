<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { gsap } from "gsap";
import { onMounted, onUnmounted, ref, watch } from 'vue';
import fonts from '../assets/fonts.json';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import performanceManager from '../utils/performance.js';
import mobileOptimizer from '../utils/mobile-optimization.js';
import emergencyOptimizer from '../utils/emergency-optimization.js';

// 定义组件属性
const props = defineProps({
  // 是否启用控制器
  enableControls: {
    type: Boolean,
    default: true
  },
  // 是否启用点击交互
  enableClickInteraction: {
    type: Boolean,
    default: true
  },
  // 是否启用相机自动动画
  enableCameraAnimation: {
    type: Boolean,
    default: true
  },
  // 是否启用粒子效果
  enableParticles: {
    type: Boolean,
    default: true
  },
  // 背景颜色
  backgroundColor: {
    type: Number,
    default: 0x000022
  },
  // 容器样式类名
  containerClass: {
    type: String,
    default: ''
  },
  // 画布样式类名
  canvasClass: {
    type: String,
    default: ''
  }
});

// 定义事件
const emit = defineEmits(['ready', 'click', 'error']);

// Canvas引用
const canvas = ref();

// 全局变量用于清理
let scene, camera, renderer, controls, composer;
let animationId;
let isPageVisible = true;
let meshesToDispose = [];
let materialsToDispose = [];
let geometriesToDispose = [];
let textureToDispose = [];
let lightsToDispose = [];
let groupsToDispose = [];
let animationsToDispose = [];
let particles = null;
let fpsMonitor = null;

// 定义函数变量
let handleResize, handleClick, tick, animate;

// 页面可见性监听
const handleVisibilityChange = () => {
  isPageVisible = !document.hidden;
  if (isPageVisible) {
    if (animate) {
      animate();
    } else if (tick) {
      tick();
    }
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
};

// 清理资源函数
const disposeThreeJSResources = () => {
  // 停止所有动画
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  // 清理所有动画
  animationsToDispose.forEach(animation => {
    if (animation && animation.kill) {
      animation.kill();
    }
  });
  gsap.killTweensOf("*");
  
  // 清理组
  groupsToDispose.forEach(group => {
    if (group && group.parent) {
      group.parent.remove(group);
    }
  });
  
  // 清理场景中的所有对象
  if (scene) {
    scene.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
      if (child.texture) {
        child.texture.dispose();
      }
    });
    
    // 清空场景
    while(scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  }
  
  // 清理几何体
  geometriesToDispose.forEach(geometry => {
    if (geometry && geometry.dispose) geometry.dispose();
  });
  
  // 清理材质
  materialsToDispose.forEach(material => {
    if (material && material.dispose) material.dispose();
  });
  
  // 清理纹理
  textureToDispose.forEach(texture => {
    if (texture && texture.dispose) texture.dispose();
  });
  
  // 清理网格
  meshesToDispose.forEach(mesh => {
    if (mesh.geometry && mesh.geometry.dispose) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose && mat.dispose());
      } else {
        mesh.material.dispose && mesh.material.dispose();
      }
    }
    if (mesh.parent) mesh.parent.remove(mesh);
  });
  
  // 清理控制器
  if (controls) {
    controls.dispose();
    controls = null;
  }
  
  // 清理后处理
  if (composer) {
    composer.dispose && composer.dispose();
    composer = null;
  }
  
  // 清理渲染器
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer = null;
  }
  
  // 清理相机
  camera = null;
  scene = null;
  
  // 清理全局变量
  if (window.__THREE_RENDERER__) {
    delete window.__THREE_RENDERER__;
  }
  if (window.__THREE_SCENE__) {
    delete window.__THREE_SCENE__;
  }
  if (window.__THREE_COMPOSER__) {
    delete window.__THREE_COMPOSER__;
  }
  if (window.__EMERGENCY_FRAME_LIMIT__) {
    delete window.__EMERGENCY_FRAME_LIMIT__;
  }
  if (window.__THREE_RESTART_RENDER__) {
    delete window.__THREE_RESTART_RENDER__;
  }
  
  // 重置紧急优化器
  emergencyOptimizer.reset();
  
  // 移除事件监听器
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  if (handleResize) {
    window.removeEventListener('resize', handleResize);
  }
  if (handleClick && props.enableClickInteraction) {
    window.removeEventListener('click', handleClick);
  }
  
  // 清空数组
  meshesToDispose = [];
  materialsToDispose = [];
  geometriesToDispose = [];
  textureToDispose = [];
  lightsToDispose = [];
  groupsToDispose = [];
  animationsToDispose = [];
  particles = null;
  
  // 强制垃圾回收（如果可用）
  if (window.gc) {
    window.gc();
  }
};

// 初始化3D场景
const init3DScene = () => {
  try {
    // 集成性能管理器
    performanceManager.addObserver((event, data) => {
      if (event === 'lowMemory' && data) {
        // 可以在这里降低3D渲染质量
      }
    });
    
    // 添加页面可见性监听
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(props.backgroundColor);

    // 字体和文字几何体数据
    const fontLoader = new FontLoader();
    let font;
    const loadFont = new Promise((resolve, reject) => {
      font = fontLoader.parse(fonts);
      resolve();
    });

    const textGeometry = {
      五行: ["金", "木", "水", "火", "土"],
      八卦: ["乾", "坤", "震", "巽", "坎", "艮", "离", "兑"],
      八门: ["休", "生", "伤", "杜", "景", "死", "惊", "开"],
      八神: ["值符", "螣蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"],
      九星: ["天蓬", "天任", "天冲", "天辅", "天英", "天芮", "天柱", "天心"],
      数字: ["壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖", "拾"],
      天干: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
      地支: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
      节气: [
        "立  春", "雨  水", "惊  蛰", "春  分", "清  明", "谷  雨",
        "立  夏", "小  满", "芒  种", "夏  至", "小  暑", "大  暑",
        "立  秋", "处  暑", "白  露", "秋  分", "寒  露", "霜  降",
        "立  冬", "小  雪", "大  雪", "冬  至", "小  寒", "大  寒"
      ],
    };

    const data = [
      {
        innerRing: 2,
        outerRing: 1.5,
        lineWidth: 0.1,
        circleWidth: [0.1, 0.1],
        lineNum: 8,
        text: [0xffffff],
        offsetX: 0,
        offsetY: 0,
        size: 0.3,
        direction: -1,
        duration: 40,
      },
      {
        innerRing: 3.5,
        outerRing: 0.7,
        lineWidth: 0.15,
        circleWidth: [0.1, 0.1],
        lineNum: 8,
        text: textGeometry["八神"],
        offsetX: -0.2,
        offsetY: -0.08,
        size: 0.3,
        direction: 1,
        duration: 10,
      },
      {
        innerRing: 4.2,
        outerRing: 0.7,
        lineWidth: 0.15,
        circleWidth: [0.1, 0.1],
        lineNum: 8,
        text: textGeometry["九星"],
        offsetX: -0.2,
        offsetY: -0.08,
        size: 0.3,
        direction: -1,
        duration: 20,
      },
      {
        innerRing: 4.9,
        outerRing: 0.7,
        lineWidth: 0.15,
        circleWidth: [0.1, 0.1],
        lineNum: 8,
        text: textGeometry["八门"],
        offsetX: -0.4,
        offsetY: -0.2,
        size: 0.3,
        direction: 1,
        duration: 30,
      },
      {
        innerRing: 5.6,
        outerRing: 0.7,
        lineWidth: 0.15,
        circleWidth: [0.1, 0.1],
        lineNum: 8,
        text: textGeometry["天干"],
        offsetX: -0.4,
        offsetY: -0.2,
        size: 0.3,
        direction: 1,
        duration: 30,
      },
      {
        innerRing: 6.3,
        outerRing: 0.4,
        lineWidth: 0.15,
        circleWidth: [0, 0],
        lineNum: 60,
        text: textGeometry["天干"],
        offsetX: -0.13,
        offsetY: 0.01,
        size: 0.2,
        direction: 1,
        duration: 25,
      },
      {
        innerRing: 6.7,
        outerRing: 0.4,
        lineWidth: 0.15,
        circleWidth: [0, 0],
        lineNum: 60,
        text: textGeometry["地支"],
        offsetX: -0.13,
        offsetY: -0.07,
        size: 0.2,
        direction: 1,
        duration: 25,
      },
      {
        innerRing: 7.1,
        outerRing: 0.5,
        lineWidth: 0.15,
        circleWidth: [0.1, 0.1],
        lineNum: 24,
        text: textGeometry["节气"],
        offsetX: -0.36,
        offsetY: -0.03,
        size: 0.2,
        direction: 1,
        duration: 30,
      },
      {
        innerRing: 7.6,
        outerRing: 0.8,
        lineWidth: 0.15,
        circleWidth: [0.1, 0.1],
        lineNum: 32,
        text: textGeometry["八卦"],
        offsetX: -0.3,
        offsetY: -0.1,
        size: 0.4,
        direction: -1,
        duration: 60,
      },
      {
        innerRing: 8.4,
        outerRing: 0.5,
        lineWidth: 0.15,
        circleWidth: [0.1, 0.1],
        lineNum: 50,
        text: textGeometry["五行"],
        offsetX: -0.13,
        offsetY: -0.02,
        size: 0.2,
        direction: 1,
        duration: 35,
      },
      {
        innerRing: 8.9,
        outerRing: 1,
        lineWidth: 0.1,
        circleWidth: [1, 0],
        lineNum: 64,
        text: [0x000000],
        offsetX: 0,
        offsetY: 0,
        size: 0.3,
        direction: 1,
        duration: 30,
      },
    ];

    const Rings = [];
    const duration = [
      0, 0.7, 0.7, 0.7, 0.7, 0, 0.7, 0.7, 0.7, 0.7, 0.7, 0, 0.7, 0.7, 0.7,
    ];

    // Ring创建函数
    const Ring = ({
      innerRing,
      outerRing,
      lineWidth,
      circleWidth,
      lineNum,
      offsetX,
      offsetY,
      text,
      size,
      direction,
      duration,
    }) => {
      const RingGroup = new THREE.Group();
      const circle = [0, outerRing];
      
      const materialOptions = {
        color: 0xffffff,
        side: THREE.DoubleSide,
      };
      
      if (mobileOptimizer.devicePerformance !== 'low') {
        materialOptions.emissive = 0x333333;
        materialOptions.emissiveIntensity = 0.3;
      }
      
      const material = new THREE.MeshStandardMaterial(materialOptions);
      
      materialsToDispose.push(material);
      groupsToDispose.push(RingGroup);

      // create ring
      circle.forEach((i, j) => {
        const RingGeo = new THREE.RingGeometry(
          innerRing + i,
          innerRing + circleWidth[j] + i,
          64,
          1
        );
        const Ring = new THREE.Mesh(RingGeo, material);
        RingGroup.add(Ring);
      });

      // create line
      for (let i = 0; i < lineNum; i++) {
        const r = innerRing + circle[1] / 2;
        const rad = ((2 * Math.PI) / lineNum) * i;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        const planeGeo = new THREE.PlaneGeometry(lineWidth, circle[1]);
        const line = new THREE.Mesh(planeGeo, material);

        line.position.set(x, y, 0);
        line.rotation.set(0, 0, rad + Math.PI / 2);
        RingGroup.add(line);
      }

      // create text
      if (text.length > 1) {
        const txtMaterialOptions = { 
          color: 0xffffff,
        };
        
        if (mobileOptimizer.devicePerformance === 'high') {
          txtMaterialOptions.emissive = 0x666666;
          txtMaterialOptions.emissiveIntensity = 0.4;
          txtMaterialOptions.metalness = 0.2;
          txtMaterialOptions.roughness = 0.3;
        } else if (mobileOptimizer.devicePerformance === 'medium') {
          txtMaterialOptions.emissive = 0x444444;
          txtMaterialOptions.emissiveIntensity = 0.2;
        }
        
        const sharedTxtMaterial = new THREE.MeshStandardMaterial(txtMaterialOptions);
        materialsToDispose.push(sharedTxtMaterial);
        
        const geometryCache = new Map();
        
        for (let i = 0; i < lineNum; i++) {
          const r = innerRing + circle[1] / 2;
          const rad = ((2 * Math.PI) / lineNum) * i + Math.PI / lineNum;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          const textContent = text[i % text.length];
          
          let txtGeo = geometryCache.get(textContent);
          if (!txtGeo) {
            const curveSegments = 16;
            
            txtGeo = new TextGeometry(textContent, {
              font: font,
              size: size,
              height: 0.01,
              curveSegments: curveSegments,
            });
            txtGeo.translate(offsetX, offsetY, 0);
            geometryCache.set(textContent, txtGeo);
            geometriesToDispose.push(txtGeo);
          }
          
          var txtMesh = new THREE.Mesh(txtGeo, sharedTxtMaterial);
          txtMesh.position.set(x, y, 0.05);
          txtMesh.rotation.set(0, 0, rad + -Math.PI / 2);
          RingGroup.add(txtMesh);
          meshesToDispose.push(txtMesh);
        }
      }

      // create bagua
      if (text.length == 1) {
        const baguaData = [
          [1, 1, 1], [0, 0, 0], [0, 0, 1], [0, 1, 0],
          [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0],
        ];
        for (let i = 0; i < lineNum; i++) {
          const r = innerRing + circle[1] / 2;
          const rad = ((2 * Math.PI) / lineNum) * i + Math.PI / lineNum;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          RingGroup.add(
            createBagua(baguaData[i % 8], x, y, 0.0001, rad + Math.PI / 2, text[0]),
            createBagua(baguaData[i % 8], x, y, -0.0001, rad + Math.PI / 2, text[0])
          );
        }
      }

      // animation
      const rotationAnimation = gsap.to(RingGroup.rotation, {
        duration: duration,
        z: Math.PI * 2 * direction,
        repeat: -1,
        ease: "none",
      });
      animationsToDispose.push(rotationAnimation);

      if (true) {
        const amColor = { r: 1, g: 1, b: 1 };
        const explode = gsap.timeline({ 
          repeat: -1, 
          delay: 5 + Math.random() * 10,
          repeatDelay: 10 + Math.random() * 10
        });
        
        explode
          .to(RingGroup.position, {
            duration: 2,
            ease: "ease.inOut",
            y: Math.random() * 5 - 2.5,
            delay: 5,
          })
          .to(amColor, {
            r: 133 / 255,
            g: 193 / 255,
            b: 255 / 255,
            duration: 3,
            onUpdate: () => {
              if (ambientLight) {
                ambientLight.color.setRGB(amColor.r, amColor.g, amColor.b);
              }
            },
          })
          .to(RingGroup.position, {
            duration: 2,
            ease: "ease.inOut",
            delay: 8,
            y: 0,
          })
          .to(amColor, {
            r: 1,
            g: 1,
            b: 1,
            duration: 4,
            onUpdate: () => {
              if (ambientLight) {
                ambientLight.color.setRGB(amColor.r, amColor.g, amColor.b);
              }
            },
          });
          
        animationsToDispose.push(explode);
      }

      RingGroup.rotateX(-Math.PI / 2);
      return RingGroup;
    };

    // 太极创建函数
    const createTaiji = (position, scale) => {
      const taiji = new THREE.Group();
      const createCircle = (r, color, thetaStart, thetaLength) => {
        const material = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
        });
        const geometry = new THREE.CircleGeometry(r, 64, thetaStart, thetaLength);
        const circle = new THREE.Mesh(geometry, material);
        return circle;
      };

      const ying = createCircle(1.8, 0x000000, 0, Math.PI);
      const yang = createCircle(1.8, 0xffffff, Math.PI, Math.PI);
      const Lblack = createCircle(0.9, 0x000000, 0, Math.PI * 2);
      const Lwhite = createCircle(0.9, 0xffffff, 0, Math.PI * 2);
      const Sblack = createCircle(0.25, 0x000000, 0, Math.PI * 2);
      const Swhite = createCircle(0.25, 0xffffff, 0, Math.PI * 2);

      const Lblack1 = createCircle(0.9, 0x000000, 0, Math.PI * 2);
      const Lwhite1 = createCircle(0.9, 0xffffff, 0, Math.PI * 2);
      const Sblack1 = createCircle(0.25, 0x000000, 0, Math.PI * 2);
      const Swhite1 = createCircle(0.25, 0xffffff, 0, Math.PI * 2);

      Lblack.position.set(-0.9, 0, 0.001);
      Lwhite.position.set(0.9, 0, 0.001);
      Swhite.position.set(-0.9, 0, 0.002);
      Sblack.position.set(0.9, 0, 0.002);
      Lblack1.position.set(-0.9, 0, -0.001);
      Lwhite1.position.set(0.9, 0, -0.001);
      Swhite1.position.set(-0.9, 0, -0.002);
      Sblack1.position.set(0.9, 0, -0.002);

      taiji.add(
        ying, yang, Lblack, Lwhite, Swhite, Sblack,
        Lblack1, Lwhite1, Swhite1, Sblack1
      );
      
      gsap.to(taiji.rotation, {
        duration: 30,
        z: -Math.PI * 2,
        repeat: -1,
        ease: "none",
      });
      
      taiji.rotateX(-Math.PI / 2);
      taiji.position.set(...position);
      taiji.scale.set(...scale);
      return taiji;
    };

    // 八卦创建函数
    const createBagua = (data, x, y, z, deg, color) => {
      const idx = [-0.32, 0, 0.32];
      const bagua = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({
        color: color,
        side: THREE.DoubleSide,
        emissive: color,
        emissiveIntensity: 0.3
      });
      
      data.forEach((i, j) => {
        if (i == 1) {
          const yang = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.2), material);
          yang.position.set(0, idx[j], 0);
          bagua.add(yang);
        }
        if (i == 0) {
          const ying1 = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.2), material);
          const ying2 = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.2), material);
          ying1.position.set(-0.275, idx[j], 0);
          ying2.position.set(0.275, idx[j], 0);
          bagua.add(ying1, ying2);
        }
      });
      
      bagua.position.set(x, y, z);
      bagua.rotation.set(0, 0, deg);
      return bagua;
    };

    // 创建粒子系统
    const createParticles = () => {
      if (!props.enableParticles) return null;
      
      let particlesCount = 1000;
      const positions = new Float32Array(particlesCount * 3);
      
      for(let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const radius = 5 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
      }
      
      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.06,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      
      particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      
      geometriesToDispose.push(particlesGeometry);
      materialsToDispose.push(particlesMaterial);
      meshesToDispose.push(particles);
      
      const particleAnimation = gsap.to(particles.rotation, {
        duration: 80,
        y: Math.PI * 2,
        repeat: -1,
        ease: 'none'
      });
      animationsToDispose.push(particleAnimation);
      
      return particles;
    };

    // 加载字体并创建环
    loadFont.then(() => {
      data.forEach((item) => {
        Rings.push(Ring(item));
      });
      start();
    });

    // 开始函数
    const start = function () {
      const showRing = (item) => {
        scene.add(item);
        item.scale.set(1.2, 1.2, 1.2);
        const scaleAnimation = gsap.to(item.scale, {
          duration: 0.8,
          x: 1,
          y: 1,
          repeat: 0,
          ease: "easeInOut",
        });
        animationsToDispose.push(scaleAnimation);
      };
      
      const tl = gsap.timeline();
      Rings.forEach((item, idx) => {
        tl.to({}, { 
          duration: duration[idx],
          ease: "none" 
        }).call(() => {
          showRing(item);
        });
      });
      animationsToDispose.push(tl);
      
      // 创建粒子效果
      createParticles();
      
      // 发出ready事件
      emit('ready');
    };

    // 添加太极
    scene.add(createTaiji([0, 0, 0], [1, 1, 1]));

    // 光照
    const ambientLight = new THREE.AmbientLight(0x333366, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x3388ff, 2, 15);
    pointLight1.position.set(0, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff3366, 2, 15);
    pointLight2.position.set(5, -2, 3);
    scene.add(pointLight2);

    // 光源动画
    if (true) {
      const lightAnimation1 = gsap.to(pointLight1.position, {
        duration: 6,
        x: 3,
        z: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      const lightAnimation2 = gsap.to(pointLight2.position, {
        duration: 8,
        x: -3,
        z: -2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      animationsToDispose.push(lightAnimation1, lightAnimation2);
    }

    // 尺寸
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // 相机
    camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    camera.position.y = 10;
    camera.position.x = 10;
    camera.position.z = 10;
    camera.lookAt(scene.position);
    scene.add(camera);

    // 渲染器
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 将渲染器和场景设置为全局变量，供性能监控使用
    window.__THREE_RENDERER__ = renderer;
    window.__THREE_SCENE__ = scene;
    window.__THREE_COMPOSER__ = composer;
    window.emergencyOptimizer = emergencyOptimizer;
    
    // 设置渲染重启函数
    window.__THREE_RESTART_RENDER__ = () => {
      if (animate && isPageVisible) {
        animate();
      } else if (tick && isPageVisible) {
        tick();
      }
    };

    // 后期处理
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 添加辉光效果
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(sizes.width, sizes.height),
      0.4,
      0.3,
      0.8
    );
    composer.addPass(bloomPass);

    // 添加输出通道
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // 窗口调整大小事件
    handleResize = () => {
      sizes.height = window.innerHeight;
      sizes.width = window.innerWidth;

      if (camera) {
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
      }

      if (renderer) {
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
      
      if (composer) {
        composer.setSize(sizes.width, sizes.height);
      }
      if (bloomPass) {
        bloomPass.resolution.set(sizes.width, sizes.height);
      }
    };
    
    window.addEventListener("resize", handleResize);

    // 控制器
    if (props.enableControls) {
      controls = new OrbitControls(camera, canvas.value);
      controls.enableDamping = true;
      controls.maxDistance = 50;
      controls.enablePan = false;
    }

    // 相机自动动画
    const cameraAnimation = () => {
      if (props.enableCameraAnimation) {
        const timeline = gsap.timeline({
          repeat: -1, 
          repeatDelay: 10,
          paused: true
        });
        
        timeline.to(camera.position, {
          duration: 12,
          x: 15,
          y: 8,
          z: 0,
          ease: "power2.inOut",
          onUpdate: () => {
            if (camera && scene) camera.lookAt(scene.position);
          }
        });
        
        timeline.to(camera.position, {
          duration: 12,
          x: 0,
          y: 15,
          z: 10,
          ease: "power2.inOut",
          onUpdate: () => {
            if (camera && scene) camera.lookAt(scene.position);
          }
        });
        
        timeline.to(camera.position, {
          duration: 12,
          x: -5,
          y: 3,
          z: 15,
          ease: "power2.inOut",
          onUpdate: () => {
            if (camera && scene) camera.lookAt(scene.position);
          }
        });
        
        timeline.to(camera.position, {
          duration: 12,
          x: 10,
          y: 10,
          z: 10,
          ease: "power2.inOut",
          onUpdate: () => {
            if (camera && scene) camera.lookAt(scene.position);
          }
        });
        
        setTimeout(() => {
          if (timeline) timeline.play();
        }, 5000);
        
        animationsToDispose.push(timeline);
      }
    };

    cameraAnimation();

    // 添加点击交互
    if (props.enableClickInteraction) {
      handleClick = (event) => {
        emit('click', event);
        
        // 点击时触发爆炸效果
        const explodeAnimation = gsap.timeline({
          onComplete: () => {
            const index = animationsToDispose.indexOf(explodeAnimation);
            if (index > -1) {
              animationsToDispose.splice(index, 1);
            }
          }
        });
        
        animationsToDispose.push(explodeAnimation);
        
        // 所有环同时向外扩张然后恢复
        Rings.forEach((ring, index) => {
          if (!ring) return;
          
          const delay = index * 0.05;
          explodeAnimation
            .to(ring.scale, {
              duration: 0.5,
              x: 1.2,
              y: 1.2,
              z: 1.2,
              ease: "back.out",
              delay
            }, 0)
            .to(ring.scale, {
              duration: 0.5,
              x: 1,
              y: 1,
              z: 1,
              ease: "power2.out",
              delay: 0.5 + delay
            }, 0.5);
        });
        
        // 同时改变光源颜色
        if (pointLight1) {
          const originalColor = { r: pointLight1.color.r, g: pointLight1.color.g, b: pointLight1.color.b };
          const targetColor = { 
            r: 0.5 + Math.random() * 0.5,
            g: 0.5 + Math.random() * 0.5, 
            b: 0.5 + Math.random() * 0.5 
          };
          
          explodeAnimation
            .to(pointLight1, {
              duration: 0.5,
              intensity: 4,
            }, 0)
            .to(targetColor, {
              duration: 0.5,
              r: targetColor.r,
              g: targetColor.g,
              b: targetColor.b,
              onUpdate: () => {
                if (pointLight1) {
                  pointLight1.color.setRGB(targetColor.r, targetColor.g, targetColor.b);
                }
              }
            }, 0)
            .to(pointLight1, {
              duration: 1,
              intensity: 2,
              delay: 0.5
            }, 0.5)
            .to(originalColor, {
              duration: 1,
              r: originalColor.r,
              g: originalColor.g,
              b: originalColor.b,
              delay: 0.5,
              onUpdate: () => {
                if (pointLight1) {
                  pointLight1.color.setRGB(originalColor.r, originalColor.g, originalColor.b);
                }
              }
            }, 0.5);
        }
      };
      
      window.addEventListener('click', handleClick);
    }

    // 初始化FPS监控
    fpsMonitor = mobileOptimizer.createFPSMonitor();
    let frameCount = 0;
    let lastFrameTime = Date.now();
    
    // 渲染循环
    tick = () => {
      if (!isPageVisible) return;
      
      frameCount++;
      const currentTime = Date.now();
      
      let frameInterval = 1000 / 60;
      
      if (window.__EMERGENCY_FRAME_LIMIT__) {
        frameInterval = Math.max(frameInterval, window.__EMERGENCY_FRAME_LIMIT__);
      }
      
      if (currentTime - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(tick);
        return;
      }
      
      lastFrameTime = currentTime;
      
      let fps = 60;
      if (frameCount % 10 === 0) {
        fps = fpsMonitor();
      }
      
      if (frameCount % 120 === 0) {
        const memoryInfo = performanceManager.getMemoryInfo();
        const memoryUsage = memoryInfo ? memoryInfo.usageRatio : 0;
        emergencyOptimizer.checkEmergencyConditions(fps, memoryUsage);
      }
      
      try {
        if (controls) controls.update();
        if (composer) composer.render();
      } catch (error) {
        console.warn('渲染错误:', error);
        emit('error', error);
      }
      
      animationId = requestAnimationFrame(tick);
    };
    
    // 动画函数（可被外部调用）
    animate = () => {
      if (isPageVisible && !animationId) {
        tick();
      }
    };
    
    tick();

  } catch (error) {
    console.error('初始化3D场景失败:', error);
    emit('error', error);
  }
};

// 监听属性变化
watch(() => props.backgroundColor, (newColor) => {
  if (scene) {
    scene.background = new THREE.Color(newColor);
  }
});

onMounted(() => {
  init3DScene();
});

onUnmounted(() => {
  try {
    disposeThreeJSResources();
  } catch (error) {
    console.error('清理Three.js资源时发生错误:', error);
  }
});

// 暴露方法给父组件
defineExpose({
  // 重新开始动画
  startAnimation: () => {
    if (animate) animate();
  },
  // 停止动画
  stopAnimation: () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  },
  // 获取场景对象
  getScene: () => scene,
  // 获取相机对象
  getCamera: () => camera,
  // 获取渲染器对象
  getRenderer: () => renderer
});
</script>

<template>
  <div :class="['qimen-disk-container', containerClass]">
    <canvas ref="canvas" :class="canvasClass"></canvas>
  </div>
</template>

<style scoped>
.qimen-disk-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.qimen-disk-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
