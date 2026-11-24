import { Injectable } from '@angular/core';
import * as LocAR from 'locar';
import * as THREE from 'three';
import { ArPuntoCercano } from '../models/sig.models';

export interface LocarCallbacks {
  onCentroDetectado: (codigo: string) => void;
  onEstadoCamara: (activa: boolean, detalle: string) => void;
}

@Injectable({ providedIn: 'root' })
export class LocarEngineService {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private locar: LocAR.LocAR | null = null;
  private webcam: LocAR.Webcam | null = null;
  private orientationControls: LocAR.DeviceOrientationControls | null = null;
  private clickHandler: LocAR.ClickHandler | null = null;
  private animFrameId: number | null = null;
  private markers: THREE.Sprite[] = [];
  private gridHelper: THREE.GridHelper | null = null;
  private rumboSimuladoRad = 0;
  private usandoOrientacionReal = false;
  private hostEl: HTMLElement | null = null;
  private callbacks: LocarCallbacks | null = null;

  iniciar(hostElement: HTMLElement, callbacks: LocarCallbacks): void {
    this.detener();
    this.hostEl = hostElement;
    this.callbacks = callbacks;

    this.scene = new THREE.Scene();
    this.gridHelper = new THREE.GridHelper(300, 30, 0x38bdf8, 0x334155);
    this.gridHelper.position.y = -2;
    this.scene.add(this.gridHelper);

    const width = hostElement.clientWidth || window.innerWidth;
    const height = hostElement.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.domElement.className = 'locar-webgl-canvas';
    hostElement.appendChild(this.renderer.domElement);

    this.locar = new LocAR.LocAR(this.scene, this.camera, {
      gpsMinDistance: 3,
      gpsMinAccuracy: 80,
    });

    this.clickHandler = new LocAR.ClickHandler(this.renderer);

    // Cámara web trasera (si existe en dispositivo; si falla en escritorio continúa el modo simulador)
    try {
      this.webcam = new LocAR.Webcam({ video: { facingMode: 'environment' } });
      this.webcam.on('webcamstarted', (ev: LocAR.WebcamStartedEvent) => {
        if (this.gridHelper) {
          this.gridHelper.visible = false;
        }
        if (this.webcam?.video && this.hostEl) {
          this.webcam.video.className = 'locar-webcam-video';
          this.hostEl.prepend(this.webcam.video);
        }
        callbacks.onEstadoCamara(true, `Cámara activa (${ev.videoWidth}x${ev.videoHeight})`);
      });
      this.webcam.on('webcamerror', (ev: LocAR.WebcamErrorEvent) => {
        callbacks.onEstadoCamara(false, `Cámara no disponible (${ev.message}). Modo simulador activo.`);
      });
    } catch {
      callbacks.onEstadoCamara(false, 'Cámara no disponible en este equipo. Modo simulador 3D activo.');
    }

    // Controles de brújula / giroscopio móvil
    this.orientationControls = new LocAR.DeviceOrientationControls(this.camera, {
      smoothingFactor: 0.2,
      enablePermissionDialog: false,
    });
    this.orientationControls.on('deviceorientationgranted', () => {
      this.usandoOrientacionReal = true;
      this.orientationControls?.connect();
    });
    this.orientationControls.on('deviceorientationerror', () => {
      this.usandoOrientacionReal = false;
    });
    this.orientationControls.init();

    this.renderer.domElement.addEventListener('click', this.handleCanvasClick);
    window.addEventListener('resize', this.handleResize);

    this.animar();
  }

  actualizarPosicionYMarcadores(
    lon: number,
    lat: number,
    puntos: ArPuntoCercano[],
    usarGpsReal: boolean,
  ): void {
    if (!this.locar || !this.scene) return;

    if (usarGpsReal) {
      void this.locar.startGps().catch(() => this.locar?.fakeGps(lon, lat, 0, 5));
    } else {
      this.locar.stopGps();
      this.locar.fakeGps(lon, lat, 0, 5);
    }

    for (const sprite of this.markers) {
      this.scene.remove(sprite);
      sprite.material.map?.dispose();
      sprite.material.dispose();
    }
    this.markers = [];

    for (const item of puntos) {
      const sprite = this.crearTarjetaSprite(item);
      this.locar.add(sprite, item.centro.lon, item.centro.lat, 3, {
        codigo: item.centro.codigo,
      });
      this.markers.push(sprite);
    }
  }

  rotarRumboSimulado(deltaGrados: number): void {
    this.rumboSimuladoRad += (deltaGrados * Math.PI) / 180;
  }

  setRumboSimulado(grados: number): void {
    this.rumboSimuladoRad = (-grados * Math.PI) / 180;
  }

  private crearTarjetaSprite(item: ArPuntoCercano): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(8, 8, 496, 184, 24);
      ctx.fill();

      ctx.strokeStyle = '#cf222e';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#cf222e';
      ctx.beginPath();
      ctx.roundRect(24, 24, 130, 42, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(item.centro.unidadSigla ?? item.centro.codigo, 38, 53);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillText(`${item.distanciaM} m (${item.cardinal})`, 172, 54);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillText(item.centro.nombre.slice(0, 32), 26, 108);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '21px Inter, sans-serif';
      const edificio = item.centro.edificioCodigo ?? item.centro.sedeCodigo ?? 'UAGRM';
      const pisoTxt = item.centro.piso === 0 ? 'PB' : `Piso ${item.centro.piso}`;
      ctx.fillText(`${edificio} • ${pisoTxt} • ${item.centro.facultadSigla ?? ''}`, 26, 152);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    const escala = Math.max(8, Math.min(22, item.distanciaM * 0.16));
    sprite.scale.set(escala * 2.4, escala, 1);
    sprite.userData = { codigo: item.centro.codigo };
    return sprite;
  }

  private readonly handleCanvasClick = (): void => {
    if (!this.clickHandler || !this.camera || !this.scene || !this.callbacks) return;
    const hits = this.clickHandler.raycast(this.camera, this.scene);
    const hit = hits.find((h) => typeof h.object.userData?.['codigo'] === 'string');
    if (hit) {
      this.callbacks.onCentroDetectado(hit.object.userData['codigo'] as string);
    }
  };

  private readonly handleResize = (): void => {
    if (!this.hostEl || !this.camera || !this.renderer) return;
    const width = this.hostEl.clientWidth || window.innerWidth;
    const height = this.hostEl.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animar = (): void => {
    this.animFrameId = requestAnimationFrame(this.animar);
    if (this.usandoOrientacionReal && this.orientationControls?.deviceOrientation) {
      this.orientationControls.update();
    } else if (this.camera) {
      this.camera.rotation.set(0, this.rumboSimuladoRad, 0);
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  detener(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    this.renderer?.domElement.removeEventListener('click', this.handleCanvasClick);
    this.orientationControls?.dispose();
    this.webcam?.dispose();
    this.locar?.stopGps();

    for (const sprite of this.markers) {
      sprite.material.map?.dispose();
      sprite.material.dispose();
    }
    this.markers = [];

    if (this.hostEl) {
      this.hostEl.innerHTML = '';
    }
    this.renderer?.dispose();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.gridHelper = null;
    this.locar = null;
    this.webcam = null;
    this.orientationControls = null;
    this.clickHandler = null;
  }
}
