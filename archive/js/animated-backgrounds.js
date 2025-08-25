class AnimatedBackgrounds {
  constructor(options = {}) {
    this.options = {
      container: '.background-container',
      controls: '.bg-controls',
      defaultBg: 1,
      totalBgs: 5,
      ...options
    };

    this.currentBg = this.options.defaultBg;
    this.init();
  }

  init() {
    this.container = document.querySelector(this.options.container);
    this.controls = document.querySelector(this.options.controls);
    
    if (!this.container || !this.controls) {
      console.error('No se encontraron los elementos necesarios para AnimatedBackgrounds');
      return;
    }

    this.setupControls();
    this.selectBackground(this.currentBg);
  }

  setupControls() {
    // Configurar los botones de control
    const thumbs = this.controls.querySelectorAll('.bg-thumb');
    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.selectBackground(index + 1));
    });

    // Configurar el botón aleatorio
    const randomBtn = this.controls.querySelector('.random-btn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => this.randomBackground());
    }
  }

  selectBackground(bgNumber) {
    // Limpiar Three.js si está activo
    if ((this.currentBg === 5 || this.currentBg === 6) && this.scene) {
      this.cleanupThreeJS();
    }

    // Ocultar todos los fondos primero
    const allBackgrounds = this.container.querySelectorAll('.animated-bg, .image-bg, .three-bg');
    allBackgrounds.forEach(bg => {
      bg.classList.add('hidden');
      bg.classList.remove('active');
    });

    // Desactivar todos los thumbs
    const allThumbs = this.controls.querySelectorAll('.bg-thumb');
    allThumbs.forEach(thumb => thumb.classList.remove('active'));
    
    // Mostrar nuevo fondo
    this.currentBg = bgNumber;
    const newBg = this.container.querySelector(`#bg${this.currentBg}`);
    const newThumb = this.controls.querySelector(`.bg-thumb:nth-child(${this.currentBg})`);
    
    if (newBg) {
      newBg.classList.remove('hidden');
      newBg.classList.add('active');
    }
    if (newThumb) {
      newThumb.classList.add('active');
    }

    // Inicializar Three.js si es necesario
    if (bgNumber === 5) {
      this.initThreeJSIfNeeded('particles');
    }
    if (bgNumber === 6) {
      this.initThreeJSIfNeeded('spheres');
    }
  }

  cleanupThreeJS() {
    if (this.scene) {
      // Detener la animación
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      
      // Limpiar la escena
      if (this.scene.children) {
        while(this.scene.children.length > 0) { 
          const object = this.scene.children[0];
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
          this.scene.remove(object);
        }
      }
      
      // Limpiar el renderer
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
      
      // Limpiar los controles
      if (this.threeControls) {
        this.threeControls.dispose();
      }
      
      // Limpiar las referencias de Three.js
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.threeControls = null;
      this.particles = null;
      this.cubeGroup = null;

      // Asegurarnos de que el contenedor de Three.js esté limpio
      const threeContainer = document.querySelector('#bg5');
      if (threeContainer) {
        while (threeContainer.firstChild) {
          threeContainer.removeChild(threeContainer.firstChild);
        }
      }
    }
  }

  randomBackground() {
    let newBg;
    do {
      newBg = Math.floor(Math.random() * this.options.totalBgs) + 1;
    } while (newBg === this.currentBg);
    
    this.selectBackground(newBg);
  }

  initThreeJSIfNeeded(type = 'particles') {
    const bgId = (type === 'spheres') ? '#bg6' : '#bg5';
    if (!this.scene && !document.querySelector(bgId).classList.contains('hidden')) {
      this.initThreeJS(type);
      this.animate();
      window.addEventListener('resize', () => this.onWindowResize());
    }
  }

  initThreeJS(type = 'particles') {
    const container = document.querySelector(type === 'spheres' ? '#bg6' : '#bg5');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true
    });

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    // Configurar controles
    this.threeControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.setupThreeJSControls();

    // Configurar luces
    this.setupLights();

    if (type === 'particles') {
      this.setupParticles();
      this.setupCubes();
    } else if (type === 'spheres') {
      this.setupSpheres();
    }

    this.camera.position.z = 4;
  }

  setupThreeJSControls() {
    this.threeControls.enableDamping = true;
    this.threeControls.dampingFactor = 0.05;
    this.threeControls.screenSpacePanning = false;
    this.threeControls.minDistance = 3;
    this.threeControls.maxDistance = 8;
    this.threeControls.maxPolarAngle = Math.PI;
    this.threeControls.enableZoom = true;
    this.threeControls.autoRotate = false;
    this.threeControls.enablePan = false;
    this.threeControls.rotateSpeed = 0.5;
    this.threeControls.enableRotate = true;
    this.threeControls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0ee0c8, 2);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);
  }

  setupParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.012,
      color: '#0ee0c8',
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);
  }

  setupCubes() {
    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: '#0ee0c8',
      transparent: true,
      opacity: 0.85,
      wireframe: true,
      wireframeLinewidth: 3
    });

    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);

    // Crear cubos de diferentes tamaños
    const sizes = [2, 1.5, 1];
    sizes.forEach(size => {
      const geometry = new THREE.BoxGeometry(size, size, size);
      const cube = new THREE.Mesh(geometry, cubeMaterial);
      this.cubeGroup.add(cube);
    });
  }

  setupSpheres() {
    this.sphereGroup = new THREE.Group();
    this.scene.add(this.sphereGroup);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: '#0ee0c8',
      transparent: true,
      opacity: 0.85,
      wireframe: true,
      wireframeLinewidth: 2
    });
    // Esfera central más pequeña y con menos polígonos
    const geometry = new THREE.SphereGeometry(1.5, 6, 4);
    const sphere = new THREE.Mesh(geometry, sphereMaterial);
    sphere.position.set(0, 0, 0);
    this.sphereGroup.add(sphere);
    // Agregar partículas como en el fondo 5
    this.setupParticles();
  }

  animate() {
    if (!this.scene) return;
    
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    if (this.threeControls) {
      this.threeControls.update();
    }
    
    if (this.particles) {
      this.particles.rotation.x += 0.0004;
      this.particles.rotation.y += 0.0004;
    }
    
    if (this.cubeGroup) {
      this.cubeGroup.rotation.x += 0.002;
      this.cubeGroup.rotation.y += 0.002;
    }

    // Rotar la esfera central en bg6
    if (this.sphereGroup && this.currentBg === 6) {
      this.sphereGroup.rotation.x += 0.002;
      this.sphereGroup.rotation.y += 0.002;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}

// Exportar la clase
window.AnimatedBackgrounds = AnimatedBackgrounds; 