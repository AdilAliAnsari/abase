import React, { useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Platform, Dimensions } from "react-native";
import { GLView } from "expo-gl";

const STAR_COLORS = [
  "#FFFFFF",
  "#FFFFAA",
  "#AAAAFF",
  "#FFAAAA",
  "#AAFFAA",
  "#FFAAFF",
  "#AAFFFF",
];

const STAR_COLORS_RGB = [
  [1.0, 1.0, 1.0],
  [1.0, 1.0, 0.67],
  [0.67, 0.67, 1.0],
  [1.0, 0.67, 0.67],
  [0.67, 1.0, 0.67],
  [1.0, 0.67, 1.0],
  [0.67, 1.0, 1.0],
];

const STAR_DENSITY = 0.000045;
const TWINKLE_PROBABILITY = 0.7;
const MIN_TWINKLE_SPEED = 2;
const MAX_TWINKLE_SPEED = 4;
const STAR_SIZE = 4;
const RESHUFFLE_INTERVAL = 5000;
const RESHUFFLE_PERCENTAGE = 0.15;
const SHOOTING_STAR_SIZE = 2;
const TARGET_FPS = 30;

interface Star {
  x: number;
  y: number;
  color: string;
  colorIndex: number;
  baseOpacity: number;
  currentOpacity: number;
  twinkle: boolean;
  twinkleSpeed: number;
  twinkleDirection: number;
  twinkleTimer: number;
}

interface ShootingStarTrail {
  x: number;
  y: number;
  opacity: number;
}

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
  trail: ShootingStarTrail[];
}

export interface BackgroundPixelStarsProps {
  backgroundColor?: string;
  starDensity?: number;
  starSize?: number;
  style?: any;
}

/* =========================================================
   WEB IMPLEMENTATION (Hardware-accelerated HTML5 2D Canvas)
   ========================================================= */

const WebPixelStars: React.FC<BackgroundPixelStarsProps> = React.memo(
  ({ backgroundColor = "#05030D", starDensity = STAR_DENSITY, starSize = STAR_SIZE }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const starsRef = useRef<Star[]>([]);
    const shootingStarsRef = useRef<ShootingStar[]>([]);
    const lastTimeRef = useRef<number>(0);

    const frameInterval = 1000 / TARGET_FPS;

    const getRandomSpawnPoint = useCallback(() => {
      const width = typeof window !== "undefined" ? window.innerWidth : 800;
      const x = Math.random() * width;
      const angle = 45 + Math.random() * 90; // Angle between 45° and 135°
      return { x, y: 0, angle };
    }, []);

    const createShootingStar = useCallback((): ShootingStar => {
      const { x, y, angle } = getRandomSpawnPoint();
      return {
        id: Date.now() + Math.random(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * 4 + 7,
        distance: 0,
        trail: [],
      };
    }, [getRandomSpawnPoint]);

    const initStars = useCallback(() => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      starsRef.current = [];
      const area = canvas.width * canvas.height;
      const count = Math.max(30, Math.floor(area * starDensity));

      for (let i = 0; i < count; i++) {
        const twinkle = Math.random() < TWINKLE_PROBABILITY;
        const x = Math.floor(Math.random() * (canvas.width / starSize)) * starSize;
        const y = Math.floor(Math.random() * (canvas.height / starSize)) * starSize;
        const colorIndex = Math.floor(Math.random() * STAR_COLORS.length);
        const opacity = Math.random() * 0.5 + 0.5;

        starsRef.current.push({
          x,
          y,
          color: STAR_COLORS[colorIndex],
          colorIndex,
          baseOpacity: opacity,
          currentOpacity: opacity,
          twinkle,
          twinkleSpeed:
            MIN_TWINKLE_SPEED + Math.random() * (MAX_TWINKLE_SPEED - MIN_TWINKLE_SPEED),
          twinkleDirection: -1,
          twinkleTimer: 0,
        });
      }
    }, [starDensity, starSize]);

    const reshuffleStars = useCallback(() => {
      if (!canvasRef.current || starsRef.current.length === 0) return;
      const canvas = canvasRef.current;
      const countToReshuffle = Math.max(
        1,
        Math.floor(starsRef.current.length * RESHUFFLE_PERCENTAGE)
      );

      for (let i = 0; i < countToReshuffle; i++) {
        const index = Math.floor(Math.random() * starsRef.current.length);
        const twinkle = Math.random() < TWINKLE_PROBABILITY;
        const x = Math.floor(Math.random() * (canvas.width / starSize)) * starSize;
        const y = Math.floor(Math.random() * (canvas.height / starSize)) * starSize;
        const colorIndex = Math.floor(Math.random() * STAR_COLORS.length);
        const opacity = Math.random() * 0.5 + 0.5;

        starsRef.current[index] = {
          x,
          y,
          color: STAR_COLORS[colorIndex],
          colorIndex,
          baseOpacity: opacity,
          currentOpacity: opacity,
          twinkle,
          twinkleSpeed:
            MIN_TWINKLE_SPEED + Math.random() * (MAX_TWINKLE_SPEED - MIN_TWINKLE_SPEED),
          twinkleDirection: -1,
          twinkleTimer: 0,
        };
      }
    }, [starSize]);

    const render = useCallback(
      (currentTime: number) => {
        if (currentTime - lastTimeRef.current < frameInterval) {
          animationFrameId.current = requestAnimationFrame(render);
          return;
        }
        lastTimeRef.current = currentTime;

        if (!canvasRef.current) {
          animationFrameId.current = requestAnimationFrame(render);
          return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          animationFrameId.current = requestAnimationFrame(render);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw pixel background stars
        const stars = starsRef.current;
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.currentOpacity;
          ctx.fillRect(star.x, star.y, starSize, starSize);

          if (star.twinkle) {
            star.twinkleTimer += 1 / TARGET_FPS;
            if (star.twinkleTimer >= star.twinkleSpeed) {
              star.twinkleTimer = 0;
              star.twinkleDirection *= -1;
            }
            if (star.twinkleTimer / star.twinkleSpeed < 0.5) {
              star.currentOpacity =
                star.twinkleDirection < 0 ? star.baseOpacity : star.baseOpacity * 0.3;
            } else {
              star.currentOpacity =
                star.twinkleDirection < 0 ? star.baseOpacity * 0.3 : star.baseOpacity;
            }
          }
        }

        // Update and draw pixel shooting stars
        if (shootingStarsRef.current.length > 0) {
          const winW = canvas.width;
          const winH = canvas.height;

          shootingStarsRef.current = shootingStarsRef.current
            .map((star) => {
              const rad = (star.angle * Math.PI) / 180;
              const newX = star.x + star.speed * Math.cos(rad);
              const newY = star.y + star.speed * Math.sin(rad);
              const newDistance = star.distance + star.speed;
              const newTrail = [...star.trail];

              if (newDistance % 8 < star.speed) {
                newTrail.push({ x: star.x, y: star.y, opacity: 1 });
              }

              const updatedTrail = newTrail
                .map((pt) => ({ ...pt, opacity: pt.opacity - 0.08 }))
                .filter((pt) => pt.opacity > 0);

              return {
                ...star,
                x: newX,
                y: newY,
                distance: newDistance,
                trail: updatedTrail,
              };
            })
            .filter(
              (star) =>
                star.x >= -40 &&
                star.x <= winW + 40 &&
                star.y >= -40 &&
                star.y <= winH + 40
            );

          shootingStarsRef.current.forEach((star) => {
            const rad = (star.angle * Math.PI) / 180;

            // Draw trail
            star.trail.forEach((trailPt) => {
              ctx.save();
              ctx.translate(trailPt.x, trailPt.y);
              ctx.rotate(rad);
              ctx.translate(-trailPt.x, -trailPt.y);
              ctx.fillStyle = `rgba(180, 242, 255, ${trailPt.opacity * 0.85})`;
              ctx.fillRect(trailPt.x, trailPt.y, SHOOTING_STAR_SIZE, SHOOTING_STAR_SIZE);
              ctx.restore();
            });

            // Draw shooting star head (4x2 pixel matrix pattern)
            const cols = 4;
            const rows = 2;
            ctx.save();
            ctx.translate(star.x, star.y);
            ctx.rotate(rad);
            ctx.translate(-star.x, -star.y);
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = 1;

            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                if ((c === 0 && r === 1) || (c === 3 && r === 0)) continue;
                ctx.fillRect(
                  star.x + c * SHOOTING_STAR_SIZE,
                  star.y + r * SHOOTING_STAR_SIZE,
                  SHOOTING_STAR_SIZE,
                  SHOOTING_STAR_SIZE
                );
              }
            }
            ctx.restore();
          });
        }

        animationFrameId.current = requestAnimationFrame(render);
      },
      [frameInterval, starSize]
    );

    useEffect(() => {
      if (!canvasRef.current) return;
      const updateSize = () => {
        if (canvasRef.current && typeof window !== "undefined") {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
          initStars();
        }
      };

      updateSize();
      animationFrameId.current = requestAnimationFrame(render);

      let shootingStarTimeoutId: any;
      const scheduleNextShootingStar = () => {
        const newShootingStar = createShootingStar();
        shootingStarsRef.current = [...shootingStarsRef.current, newShootingStar];
        const delay = Math.random() * 3500 + 2500;
        shootingStarTimeoutId = setTimeout(scheduleNextShootingStar, delay);
      };

      scheduleNextShootingStar();
      const reshuffleIntervalId = setInterval(reshuffleStars, RESHUFFLE_INTERVAL);

      if (typeof window !== "undefined") {
        window.addEventListener("resize", updateSize);
      }

      return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        clearTimeout(shootingStarTimeoutId);
        clearInterval(reshuffleIntervalId);
        if (typeof window !== "undefined") {
          window.removeEventListener("resize", updateSize);
        }
      };
    }, [render, createShootingStar, initStars, reshuffleStars]);

    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor }]} pointerEvents="none">
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </View>
    );
  }
);

/* =========================================================
   NATIVE IMPLEMENTATION (Ultra-lightweight 1-Draw WebGL Points)
   ========================================================= */

const NativePixelStars: React.FC<BackgroundPixelStarsProps> = React.memo(
  ({ backgroundColor = "#05030D", starDensity = STAR_DENSITY, starSize = STAR_SIZE }) => {
    const onContextCreate = (gl: any) => {
      const width = gl.drawingBufferWidth || Dimensions.get("window").width;
      const height = gl.drawingBufferHeight || Dimensions.get("window").height;

      const vertShaderSrc = `
        attribute vec2 aPosition;
        attribute vec3 aColor;
        attribute float aOpacity;
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          gl_Position = vec4(aPosition, 0.0, 1.0);
          gl_PointSize = ${starSize.toFixed(1)};
          vColor = aColor;
          vOpacity = aOpacity;
        }
      `;

      const fragShaderSrc = `
        precision mediump float;
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          gl_FragColor = vec4(vColor, vOpacity);
        }
      `;

      const createShader = (type: number, src: string) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
      };

      const vertShader = createShader(gl.VERTEX_SHADER, vertShaderSrc);
      const fragShader = createShader(gl.FRAGMENT_SHADER, fragShaderSrc);

      const program = gl.createProgram();
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      const aPosition = gl.getAttribLocation(program, "aPosition");
      const aColor = gl.getAttribLocation(program, "aColor");
      const aOpacity = gl.getAttribLocation(program, "aOpacity");

      gl.enableVertexAttribArray(aPosition);
      gl.enableVertexAttribArray(aColor);
      gl.enableVertexAttribArray(aOpacity);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Generate initial star dataset
      const area = width * height;
      const starCount = Math.min(200, Math.max(30, Math.floor(area * starDensity)));
      const stars: Star[] = [];

      for (let i = 0; i < starCount; i++) {
        const twinkle = Math.random() < TWINKLE_PROBABILITY;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const colorIndex = Math.floor(Math.random() * STAR_COLORS_RGB.length);
        const opacity = Math.random() * 0.5 + 0.5;

        stars.push({
          x,
          y,
          color: STAR_COLORS[colorIndex],
          colorIndex,
          baseOpacity: opacity,
          currentOpacity: opacity,
          twinkle,
          twinkleSpeed:
            MIN_TWINKLE_SPEED + Math.random() * (MAX_TWINKLE_SPEED - MIN_TWINKLE_SPEED),
          twinkleDirection: -1,
          twinkleTimer: 0,
        });
      }

      // 6 floats per star: [x, y, r, g, b, opacity]
      const vertexData = new Float32Array(starCount * 6);
      const vbo = gl.createBuffer();

      let animationFrameId: number;
      let lastTime = Date.now();

      const render = () => {
        animationFrameId = requestAnimationFrame(render);
        const now = Date.now();
        const delta = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;

        gl.viewport(0, 0, width, height);
        gl.clearColor(0.02, 0.012, 0.05, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Update star twinkling
        for (let i = 0; i < starCount; i++) {
          const s = stars[i];
          if (s.twinkle) {
            s.twinkleTimer += delta;
            if (s.twinkleTimer >= s.twinkleSpeed) {
              s.twinkleTimer = 0;
              s.twinkleDirection *= -1;
            }
            if (s.twinkleTimer / s.twinkleSpeed < 0.5) {
              s.currentOpacity =
                s.twinkleDirection < 0 ? s.baseOpacity : s.baseOpacity * 0.3;
            } else {
              s.currentOpacity =
                s.twinkleDirection < 0 ? s.baseOpacity * 0.3 : s.baseOpacity;
            }
          }

          // Normalized Device Coordinates [-1, 1]
          const ndcX = (s.x / width) * 2 - 1;
          const ndcY = -((s.y / height) * 2 - 1);
          const rgb = STAR_COLORS_RGB[s.colorIndex];

          const offset = i * 6;
          vertexData[offset] = ndcX;
          vertexData[offset + 1] = ndcY;
          vertexData[offset + 2] = rgb[0];
          vertexData[offset + 3] = rgb[1];
          vertexData[offset + 4] = rgb[2];
          vertexData[offset + 5] = s.currentOpacity;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);

        const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(
          aColor,
          3,
          gl.FLOAT,
          false,
          stride,
          2 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.vertexAttribPointer(
          aOpacity,
          1,
          gl.FLOAT,
          false,
          stride,
          5 * Float32Array.BYTES_PER_ELEMENT
        );

        gl.drawArrays(gl.POINTS, 0, starCount);
        gl.endFrameEXP();
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
        gl.deleteBuffer(vbo);
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
      };
    };

    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor }]} pointerEvents="none">
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      </View>
    );
  }
);

/* =========================================================
   MAIN EXPORT: Universal BackgroundPixelStars
   ========================================================= */

export const BackgroundPixelStars: React.FC<BackgroundPixelStarsProps> = React.memo((props) => {
  if (Platform.OS === "web") {
    return <WebPixelStars {...props} />;
  }
  return <NativePixelStars {...props} />;
});

BackgroundPixelStars.displayName = "BackgroundPixelStars";

export default BackgroundPixelStars;
