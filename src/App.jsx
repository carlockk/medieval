import { useEffect, useRef, useState } from "react";
import DailyProphetPanel from "./components/DailyProphetPanel";
import GalleryPanel from "./components/GalleryPanel";
import PanelShell from "./components/PanelShell";
import galleryFrames from "./data/galleryFrames";
import menuConfig from "./data/menuConfig";

export default function App() {
  const shadowCanvasRef = useRef(null);
  const fireCanvasRef = useRef(null);
  const panelContentRef = useRef(null);
  const isMouseTorchRef = useRef(false);
  const staticFiresRef = useRef([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const particlesRef = useRef([]);
  const [showHint, setShowHint] = useState(true);
  const [menuLayout, setMenuLayout] = useState("vertical");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [isLit, setIsLit] = useState(false);
  const [staticFires, setStaticFires] = useState([]);

  useEffect(() => {
    const shadowCanvas = shadowCanvasRef.current;
    const fireCanvas = fireCanvasRef.current;

    if (!shadowCanvas || !fireCanvas) return;

    const shadowCtx = shadowCanvas.getContext("2d");
    const fireCtx = fireCanvas.getContext("2d");

    let width = 0;
    let height = 0;
    let rafId = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      shadowCanvas.width = width;
      shadowCanvas.height = height;
      fireCanvas.width = width;
      fireCanvas.height = height;
      if (width < 640 && menuLayout !== "vertical") {
        setMenuLayout("vertical");
      }
    };

    const handleMouseMove = (event) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
      document.documentElement.style.setProperty(
        "--torch-x",
        `${event.clientX}px`
      );
      document.documentElement.style.setProperty(
        "--torch-y",
        `${event.clientY}px`
      );
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
      const newFire = {
        id: `fire-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        x: event.clientX,
        y: event.clientY,
      };
      const nextFires = [...staticFiresRef.current, newFire];
      staticFiresRef.current = nextFires;
      setStaticFires(nextFires);
      isMouseTorchRef.current = false;
      setIsLit(true);
      setShowHint(false);
    };

    const handleDoubleClick = () => {
      isMouseTorchRef.current = !isMouseTorchRef.current;
      setIsLit(
        isMouseTorchRef.current || staticFiresRef.current.length > 0
      );
      setShowHint(false);
    };

    class Flame {
      constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 6;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = Math.random() * -1.5 - 0.5;
        this.life = 1.0;
        this.r = Math.random() * 4 + 2;
      }

      update() {
        this.life -= 0.02;
        this.x += this.vx;
        this.y += this.vy;
        this.r *= 0.98;
      }

      draw() {
        fireCtx.beginPath();
        const g = fireCtx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.r * 2
        );
        const alpha = this.life * 0.7;

        if (this.life > 0.5) {
          g.addColorStop(0, `rgba(255,255,200,${alpha})`);
        } else {
          g.addColorStop(0, `rgba(255,100,0,${alpha})`);
        }
        g.addColorStop(1, "rgba(255,0,0,0)");

        fireCtx.fillStyle = g;
        fireCtx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
        fireCtx.fill();
      }
    }

    const drawLight = () => {
      shadowCtx.globalCompositeOperation = "source-over";
      shadowCtx.clearRect(0, 0, width, height);

      const baseDarkness = 0.72;
      shadowCtx.fillStyle = `rgba(0,0,0,${baseDarkness})`;
      shadowCtx.fillRect(0, 0, width, height);

      const activeLights = [];
      if (isMouseTorchRef.current) {
        activeLights.push({ x: mouseRef.current.x, y: mouseRef.current.y });
      }
      staticFiresRef.current.forEach((fire) => {
        activeLights.push({ x: fire.x, y: fire.y });
      });

      if (activeLights.length > 0) {
        shadowCtx.globalCompositeOperation = "destination-out";

        const time = performance.now() * 0.004;
        activeLights.forEach((light, index) => {
          const flicker =
            1 +
            Math.sin(time * (3.2 + index)) * 0.03 +
            Math.sin(time * (7.1 + index * 0.7)) * 0.02;
          const radius = width * 0.15 * flicker;
          const offsetX = Math.sin(time * (2.3 + index)) * 6;
          const offsetY = Math.cos(time * (2.8 + index)) * 4;
          const gx = light.x + offsetX;
          const gy = light.y + offsetY;
          const gradient = shadowCtx.createRadialGradient(
            gx,
            gy,
            0,
            gx,
            gy,
            radius
          );

          gradient.addColorStop(0, "rgba(0,0,0,0.90)");
          gradient.addColorStop(1, "rgba(0,0,0,0)");

          shadowCtx.fillStyle = gradient;
          shadowCtx.beginPath();
          shadowCtx.arc(gx, gy, radius, 0, Math.PI * 2);
          shadowCtx.fill();
        });

        shadowCtx.globalCompositeOperation = "source-over";
      }
    };

    const animate = () => {
      drawLight();

      fireCtx.clearRect(0, 0, width, height);
      fireCtx.globalCompositeOperation = "lighter";

      const emitPoints = [];
      if (isMouseTorchRef.current) {
        emitPoints.push({ x: mouseRef.current.x, y: mouseRef.current.y });
      }
      staticFiresRef.current.forEach((fire) => {
        emitPoints.push({ x: fire.x, y: fire.y });
      });
      if (emitPoints.length > 0) {
        emitPoints.forEach((point) => {
          if (Math.random() > 0.55) {
            particlesRef.current.push(new Flame(point.x, point.y));
          }
        });
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i -= 1) {
        const particle = particlesRef.current[i];
        particle.update();
        particle.draw();
        if (particle.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      rafId = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dblclick", handleDoubleClick);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dblclick", handleDoubleClick);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (staticFiresRef.current.length === 0) return;
    staticFiresRef.current = [];
    setStaticFires([]);
    setIsLit(isMouseTorchRef.current);
  }, [menuLayout]);

  const handleMenuClick = (id) => {
    const item = menuConfig.find((menuItem) => menuItem.id === id);
    setActivePanel(item?.panel ?? null);
  };

  const isHorizontal = menuLayout === "horizontal";
  const isDailyProphet = activePanel === "daily";
  const isGallery = activePanel === "gallery";

  const handleFireToggle = (id) => {
    const nextFires = staticFiresRef.current.filter((fire) => fire.id !== id);
    staticFiresRef.current = nextFires;
    setStaticFires(nextFires);
    setIsLit(isMouseTorchRef.current || nextFires.length > 0);
  };
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#222]">
      <div
        id="bg-image"
        className="absolute inset-y-0 left-0 z-0"
        style={{
          right: isHorizontal ? 0 : "var(--menu-width)",
          backgroundImage:
            "url('/fondo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="absolute inset-0 z-20 pointer-events-none">
        {staticFires.map((fire) => (
          <button
            key={fire.id}
            type="button"
            className="pointer-events-auto absolute h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,210,140,0.75)] bg-[rgba(255,170,80,0.18)] shadow-[0_0_10px_rgba(255,160,70,0.6)]"
            style={{ left: `${fire.x}px`, top: `${fire.y}px` }}
            onClick={() => handleFireToggle(fire.id)}
            aria-label="Apagar fuego"
          />
        ))}
      </div>

      <PanelShell
        active={Boolean(activePanel)}
        isGallery={isGallery}
        isHorizontal={isHorizontal}
        onClose={() => setActivePanel(null)}
        variant={activePanel ?? "default"}
        contentRef={panelContentRef}
      >
        {isDailyProphet && <DailyProphetPanel />}
        {isGallery && (
          <GalleryPanel
            frames={galleryFrames}
            isLit={isLit}
            scrollRef={panelContentRef}
          />
        )}
      </PanelShell>

      <canvas ref={shadowCanvasRef} className="absolute inset-0 z-10 block" />
      <canvas
        ref={fireCanvasRef}
        className="absolute inset-0 z-50 block pointer-events-none"
      />

      {showHint && (
        <div className="pointer-events-none absolute bottom-5 z-30 w-full text-center font-medieval text-white drop-shadow-[2px_2px_4px_black]">
          <div className="mx-auto inline-flex flex-col gap-1 rounded-[10px] border border-[rgba(255,240,200,0.45)] bg-[rgba(20,10,5,0.55)] px-4 py-2 text-[12px] tracking-[0.8px] sm:text-[13px]">
            <div className="uppercase tracking-[1.5px] text-[#f4e7c6]">
              Consejo del guardia
            </div>
            <div className="text-[#f4e7c6]">
              Click derecho: prende fuego fijo · Click en fuego: apaga
            </div>
            <div className="text-[#f4e7c6]">
              Doble click: antorcha que sigue al mouse
            </div>
          </div>
        </div>
      )}

      <aside
        className={`fixed z-40 text-[#2a160c] transition duration-200 ease-out sm:translate-x-0 sm:opacity-100 ${
          isMenuOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        } ${
          isHorizontal
            ? "left-0 right-0 top-0 flex h-[40px] items-center px-4 sm:translate-x-0 sm:opacity-100"
            : "bottom-0 right-0 top-0 flex max-w-[85vw] flex-col p-6 sm:translate-x-0 sm:opacity-100"
        } sm:pointer-events-auto`}
        style={{
          width: isHorizontal ? "100%" : "var(--menu-width)",
          backgroundImage: "url('/perga.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          boxShadow:
            isHorizontal
              ? "inset 0 0 0 2000px rgba(255, 240, 200, 0.25), 0 6px 18px rgba(0,0,0,0.35)"
              : "inset 0 0 0 2000px rgba(255, 240, 200, 0.25), -8px 0 25px rgba(0,0,0,0.5)",
          fontFamily: "MedievalSharp, Garamond, Georgia, serif",
        }}
      >
        <div
          className={
            isHorizontal
              ? "flex w-full items-center gap-4"
              : "flex w-full flex-1 flex-col"
          }
        >
          {!isHorizontal && (
            <>
              <div className="flex items-center justify-center">
                <div className="mb-4 flex flex-col items-center gap-2">
                  <img
                    src="/escudo.png"
                    alt="Escudo medieval"
                    className="h-[56px] w-auto object-contain"
                  />
                  <h3 className="text-center text-[22px] tracking-[1px] text-[#2a160c] drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    Medieval Menu
                  </h3>
                </div>
              </div>
              <div className="mb-4 h-[2px] bg-gradient-to-r from-transparent via-[rgba(80,40,10,0.6)] to-transparent" />
            </>
          )}

          <div
            className={
              isHorizontal
                ? "flex flex-1 items-center gap-4"
                : "flex flex-col"
            }
          >
            {menuConfig.map((item, index) => (
              <div
                key={item.id}
                className={isHorizontal ? "flex items-center" : "flex flex-col"}
              >
                {isHorizontal && index > 0 && (
                  <div className="mx-2 h-[18px] w-[1px] bg-[rgba(80,40,10,0.45)]" />
                )}
                {!isHorizontal && index > 0 && (
                  <div className="my-1.5 h-[1px] bg-gradient-to-r from-transparent via-[rgba(80,40,10,0.45)] to-transparent" />
                )}
                <button
                  type="button"
                  className={`text-left tracking-[0.8px] text-[#1f140c] transition duration-150 hover:-translate-y-[1px] hover:text-[#2a160c] active:translate-y-[1px] ${
                    isHorizontal
                      ? "px-1 text-[14px]"
                      : "w-full py-1 pr-4 text-[15px]"
                  }`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  {item.label}
                  {!isHorizontal && (
                    <small className="block text-[9px] opacity-70">
                      {item.detail}
                    </small>
                  )}
                </button>
              </div>
            ))}
          </div>

          {isHorizontal ? (
            <div className="ml-auto flex items-center gap-2">
              <img
                src="/escudo.png"
                alt="Escudo medieval"
                className="h-[24px] w-auto object-contain"
              />
              <div className="text-[12px] tracking-[0.6px] text-[#2a160c]">
                Usuario
              </div>
            </div>
          ) : (
            <div className="mt-auto flex items-center gap-2 pt-4 sm:gap-3 sm:pt-6">
              <div className="h-[48px] w-[48px] rounded-full border-2 border-[rgba(80,40,10,0.6)] bg-[rgba(42,22,12,0.2)] shadow-[inset_0_0_10px_rgba(0,0,0,0.35)] sm:h-[56px] sm:w-[56px]" />
              <div className="text-[14px] tracking-[0.6px] text-[#2a160c] sm:text-[16px]">
                Usuario
              </div>
            </div>
          )}
        </div>
      </aside>

      <button
        type="button"
        className="absolute right-3 top-3 z-50 flex h-[32px] w-[32px] items-center justify-center rounded-[6px] border border-[rgba(255,240,200,0.6)] bg-[rgba(42,22,12,0.7)] text-[14px] text-[#f4e7c6] shadow-[0_6px_14px_rgba(0,0,0,0.35)] sm:hidden"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      <button
        type="button"
        className="absolute bottom-3 right-3 z-50 hidden rounded-[6px] border border-[rgba(255,240,200,0.6)] bg-[rgba(42,22,12,0.7)] px-2 py-1 text-[11px] tracking-[0.6px] text-[#f4e7c6] shadow-[0_6px_14px_rgba(0,0,0,0.35)] sm:inline-flex"
        onClick={() =>
          setMenuLayout((prev) =>
            prev === "vertical" ? "horizontal" : "vertical"
          )
        }
      >
        {isHorizontal ? "Menu vertical" : "Menu horizontal"}
      </button>

    </div>
  );
}
