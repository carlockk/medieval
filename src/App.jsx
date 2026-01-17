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
  const isLitRef = useRef(false);
  const mouseRef = useRef({ x: -100, y: -100 });
  const particlesRef = useRef([]);
  const [showHint, setShowHint] = useState(true);
  const [menuLayout, setMenuLayout] = useState("vertical");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [isLit, setIsLit] = useState(false);

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
      isLitRef.current = !isLitRef.current;
      setIsLit(isLitRef.current);
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

      if (isLitRef.current) {
        shadowCtx.globalCompositeOperation = "destination-out";

        const time = performance.now() * 0.004;
        const flicker = 1 + Math.sin(time * 3.2) * 0.03 + Math.sin(time * 7.1) * 0.02;
        const radius = width * 0.15 * flicker;
        const offsetX = Math.sin(time * 2.3) * 6;
        const offsetY = Math.cos(time * 2.8) * 4;
        const gradient = shadowCtx.createRadialGradient(
          mouseRef.current.x + offsetX,
          mouseRef.current.y + offsetY,
          0,
          mouseRef.current.x + offsetX,
          mouseRef.current.y + offsetY,
          radius
        );

        gradient.addColorStop(0, "rgba(0,0,0,0.90)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        shadowCtx.fillStyle = gradient;
        shadowCtx.beginPath();
        shadowCtx.arc(
          mouseRef.current.x + offsetX,
          mouseRef.current.y + offsetY,
          radius,
          0,
          Math.PI * 2
        );
        shadowCtx.fill();

        shadowCtx.globalCompositeOperation = "source-over";
      }
    };

    const animate = () => {
      drawLight();

      fireCtx.clearRect(0, 0, width, height);
      fireCtx.globalCompositeOperation = "lighter";

      if (isLitRef.current && Math.random() > 0.3) {
        particlesRef.current.push(
          new Flame(mouseRef.current.x, mouseRef.current.y)
        );
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
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleMenuClick = (id) => {
    const item = menuConfig.find((menuItem) => menuItem.id === id);
    setActivePanel(item?.panel ?? null);
  };

  const isHorizontal = menuLayout === "horizontal";
  const isDailyProphet = activePanel === "daily";
  const isGallery = activePanel === "gallery";
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
          Haz CLICK DERECHO para encender la antorcha
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
                <h3 className="mb-4 text-center text-[26px] tracking-[1px] text-[#2a160c] drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                  Medieval Menu
                </h3>
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
                      : "w-full py-1 pr-4 text-[17px]"
                  }`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  {item.label}
                  {!isHorizontal && (
                    <small className="block text-[10px] opacity-70">
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
              <img
                src="/escudo.png"
                alt="Escudo medieval"
                className="h-[64px] w-auto object-contain sm:h-[72px]"
              />
              <div className="text-[16px] tracking-[0.6px] text-[#2a160c] sm:text-[18px]">
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
        className="absolute bottom-3 right-3 z-50 rounded-[6px] border border-[rgba(255,240,200,0.6)] bg-[rgba(42,22,12,0.7)] px-2 py-1 text-[11px] tracking-[0.6px] text-[#f4e7c6] shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
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
