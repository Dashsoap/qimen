<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { gsap } from "gsap";
import { onMounted, ref } from 'vue';
import fonts from '../assets/fonts.json';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// Canvas
const canvas = ref();
const typingText = ref();

onMounted(() => {
  // 添加打字机效果
  const text = "奇门遁甲‌是一种时空能量学，它通过符号和模型来窥测地球上的万事万物。奇门遁甲的核心在于查验天体对地球的能量频率以及地球方位的能量与气场";
  const typingSpeed = 0.15; // 打字速度，每个字的时间(秒)
  
  let currentText = "";
  const chars = text.split('');
  const timeline = gsap.timeline();
  
  chars.forEach((char, index) => {
    timeline.to(typingText.value, {
      duration: 0.01, // 瞬间更新
      onStart: () => {
        currentText += char;
        typingText.value.textContent = currentText;
      },
      delay: typingSpeed // 每个字之间的延迟
    });
  });
  
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000022); // 深蓝色背景

  //----------------------

  const fontLoader = new FontLoader();
  const fontUrl = "fonts.json";
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
    地支: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",],
    节气: [
      "立  春",
      "雨  水",
      "惊  蛰",
      "春  分",
      "清  明",
      "谷  雨",
      "立  夏",
      "小  满",
      "芒  种",
      "夏  至",
      "小  暑",
      "大  暑",
      "立  秋",
      "处  暑",
      "白  露",
      "秋  分",
      "寒  露",
      "霜  降",
      "立  冬",
      "小  雪",
      "大  雪",
      "冬  至",
      "小  寒",
      "大  寒",
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

  //Ring
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
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      emissive: 0x333333, // 添加发光效果
      emissiveIntensity: 0.5,
    });

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
      for (let i = 0; i < lineNum; i++) {
        const r = innerRing + circle[1] / 2;
        const rad = ((2 * Math.PI) / lineNum) * i + Math.PI / lineNum;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        var txtGeo = new TextGeometry(text[i % text.length], {
          font: font,
          size: size,
          height: 0.005, // 增加高度，增强立体感
          curveSegments: 16, // 增加曲线分段，提高文字清晰度
        });
        txtGeo.translate(offsetX, offsetY, 0);
        
        // 使用标准材质并增加发光效果
        var txtMater = new THREE.MeshStandardMaterial({ 
          color: 0xffffff,
          emissive: 0x888888, // 添加自发光
          emissiveIntensity: 0.7,
          metalness: 0.3,
          roughness: 0.2
        });
        
        var txtMesh = new THREE.Mesh(txtGeo, txtMater);
        txtMesh.position.set(x, y, 0.05); // 文字稍微前移，避免与其他元素重叠
        txtMesh.rotation.set(0, 0, rad + -Math.PI / 2);
        RingGroup.add(txtMesh);
      }
    }

    // create bagua
    if (text.length == 1) {
      const baguaData = [
        [1, 1, 1],
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
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
    {
      gsap.to(RingGroup.rotation, {
        duration: duration,
        z: Math.PI * 2 * direction,
        repeat: -1,
        ease: "none",
      });

      const amColor = { r: 1, g: 1, b: 1 };
      const explode = gsap.timeline({ repeat: -1, delay: 5 });
      explode
        .to(RingGroup.position, {
          duration: 1,
          ease: "ease.inOut",
          y: Math.random() * 10 - 5,
          delay: 5,
        })
        .to(amColor, {
          r: 133 / 255,
          g: 193 / 255,
          b: 255 / 255,
          duration: 2,
          onUpdate: () =>
            ambientLight.color.setRGB(amColor.r, amColor.g, amColor.b),
        })
        .to(RingGroup.position, {
          duration: 1,
          ease: "ease.inOut",
          delay: 5,
          y: 0,
        })
        .to(amColor, {
          r: 1,
          g: 1,
          b: 1,
          duration: 3,
          onUpdate: () =>
            ambientLight.color.setRGB(amColor.r, amColor.g, amColor.b),
        });
    }

    // rotate
    RingGroup.rotateX(-Math.PI / 2);
    return RingGroup;
  };

  //taiji
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
      ying,
      yang,
      Lblack,
      Lwhite,
      Swhite,
      Sblack,
      Lblack1,
      Lwhite1,
      Swhite1,
      Sblack1
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
  scene.add(createTaiji([0, 0, 0], [1, 1, 1]));

  // bagua
  const createBagua = (data, x, y, z, deg, color) => {
    const idx = [-0.32, 0, 0.32];
    const bagua = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: color,
      side: THREE.DoubleSide,
      emissive: color, // 添加自发光属性
      emissiveIntensity: 0.3
    });
    data.forEach((i, j) => {
      if (i == 1) {
        const yang = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.2), material);
        yang.position.set(0, idx[j], 0);
        bagua.add(yang);
      }
      if (i == 0) {
        const ying1 = new THREE.Mesh(
          new THREE.PlaneGeometry(0.45, 0.2),
          material
        );
        const ying2 = new THREE.Mesh(
          new THREE.PlaneGeometry(0.45, 0.2),
          material
        );
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
    const particlesCount = 800;
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
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // 添加粒子动画
    gsap.to(particles.rotation, {
      duration: 100,
      y: Math.PI * 2,
      repeat: -1,
      ease: 'none'
    });
    
    return particles;
  };

  //loadFont, Rings
  loadFont.then(() => {
    data.forEach((item) => {
      Rings.push(Ring(item));
    });
    start();
  });

  //start
  const start = function () {
    const showRing = (item) => {
      scene.add(item);
      item.scale.set(1.2, 1.2, 1.2);
      gsap.to(item.scale, {
        duration: 0.8,
        x: 1,
        y: 1,
        repeat: 0,
        ease: "easeInOut",
      });
    };
    const tl = gsap.timeline();
    Rings.forEach((item, idx) => {
      tl.to(".webgl", { duration: duration[idx] }).call(() => {
        showRing(item);
      });
    });
    
    // 创建粒子效果
    const particles = createParticles();
  };

  //----------------------

  // 光照
  const ambientLight = new THREE.AmbientLight(0x333366, 0.5);
  scene.add(ambientLight);

  // 添加定向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  // 添加点光源
  const pointLight1 = new THREE.PointLight(0x3388ff, 2, 15);
  pointLight1.position.set(0, 5, 0);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff3366, 2, 15);
  pointLight2.position.set(5, -2, 3);
  scene.add(pointLight2);

  // 光源动画
  gsap.to(pointLight1.position, {
    duration: 4,
    x: 3,
    z: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(pointLight2.position, {
    duration: 5,
    x: -3,
    z: -2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // 尺寸
  const sizes = {
    width: window.innerWidth < 767 ? window.innerWidth : window.innerWidth - 180,
    height: window.innerHeight,
  };

  // 相机
  const camera = new THREE.PerspectiveCamera(
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
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 后期处理
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 添加适度的辉光效果
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.3,  // 降低强度
    0.2,  // 减小半径
    0.9   // 提高阈值，让只有最亮的部分发光
  );
  composer.addPass(bloomPass);

  // 添加输出通道
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // 窗口调整大小事件
  window.addEventListener("resize", () => {
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth < 767 ? window.innerWidth : window.innerWidth - 180;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 更新composer大小
    composer.setSize(sizes.width, sizes.height);
    bloomPass.resolution.set(sizes.width, sizes.height);
  });

  // 控制器
  const controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.maxDistance = 50;
  controls.enablePan = false;

  // 相机自动动画
  const cameraAnimation = () => {
    const timeline = gsap.timeline({repeat: -1, repeatDelay: 5});
    
    timeline.to(camera.position, {
      duration: 8,
      x: 15,
      y: 8,
      z: 0,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(scene.position)
    });
    
    timeline.to(camera.position, {
      duration: 8,
      x: 0,
      y: 15,
      z: 10,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(scene.position)
    });
    
    timeline.to(camera.position, {
      duration: 8,
      x: -5,
      y: 3,
      z: 15,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(scene.position)
    });
    
    timeline.to(camera.position, {
      duration: 8,
      x: 10,
      y: 10,
      z: 10,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(scene.position)
    });
  };

  cameraAnimation();

  // 添加点击交互
  window.addEventListener('click', () => {
    // 点击时触发爆炸效果
    const explodeAnimation = gsap.timeline();
    
    // 所有环同时向外扩张然后恢复
    Rings.forEach((ring, index) => {
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
    explodeAnimation.to(pointLight1, {
      duration: 0.5,
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      intensity: 4,
    }, 0).to(pointLight1, {
      duration: 1,
      intensity: 2,
      delay: 0.5
    }, 0.5);
  });

  // 渲染循环
  const tick = () => {
    controls.update();
    composer.render();
    requestAnimationFrame(tick);
  };
  tick();
});
</script>

<template>
  <div class="scene-container">
    <!-- 添加文字动画容器 -->
    <div class="typing-container">
      <div class="typing-text" ref="typingText"></div>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(to bottom, #000022, #000033, #000044);
}

.scene-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 添加打字机文字样式 */
.typing-container {
  position: absolute;
  top: 30px;
  left: 0;
  width: 100%;
  z-index: 10;
  text-align: center;
  pointer-events: none; /* 允许通过文字点击下方的内容 */
}

.typing-text {
  display: inline-block;
  max-width: 80%;
  padding: 15px 25px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 300;
  line-height: 1.6;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  letter-spacing: 1px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .typing-text {
    font-size: 14px;
    padding: 10px 15px;
    max-width: 90%;
  }
}
</style>