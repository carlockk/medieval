import { useEffect, useRef, useState } from "react";

const menuItems = [
  { id: "btn1", label: "Boton 1", detail: "Accion 1" },
  { id: "btn2", label: "Boton 2", detail: "Accion 2" },
  { id: "btn3", label: "Boton 3", detail: "Accion 3" },
  { id: "btn4", label: "Boton 4", detail: "Accion 4" },
  { id: "btn5", label: "Boton 5", detail: "Accion 5" },
  { id: "btn6", label: "Boton 6", detail: "Accion 6" },
];

export default function App() {
  const shadowCanvasRef = useRef(null);
  const fireCanvasRef = useRef(null);
  const isLitRef = useRef(false);
  const mouseRef = useRef({ x: -100, y: -100 });
  const particlesRef = useRef([]);
  const [showHint, setShowHint] = useState(true);
  const [menuLayout, setMenuLayout] = useState("vertical");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

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
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
      isLitRef.current = !isLitRef.current;
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
    setActiveItem(id === "btn1" ? id : null);
  };

  const isHorizontal = menuLayout === "horizontal";
  const activeItemData = menuItems.find((item) => item.id === activeItem);
  const isDailyProphet = activeItem === "btn1";

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

      <section
        className={`fixed z-30 text-[#22150b] transition duration-300 ease-out ${
          activeItem
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{
          top: isHorizontal ? "40px" : 0,
          bottom: 0,
          left: 0,
          right: isHorizontal ? 0 : "var(--menu-width)",
          width: isHorizontal ? "100%" : "calc(100% - var(--menu-width))",
        }}
      >
        <div
          className={`relative h-full w-full overflow-y-auto border-l border-[rgba(120,80,40,0.45)] px-6 py-8 sm:px-10 sm:py-10 ${
            isDailyProphet
              ? "bg-[#e9d7b8]"
              : "bg-[#ead9ba] shadow-[inset_0_0_40px_rgba(90,50,20,0.35)]"
          }`}
          style={{
            backgroundImage: isDailyProphet
              ? "linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px), radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 60%)"
              : "radial-gradient(circle at top left, rgba(255,255,255,0.5), transparent 60%), radial-gradient(circle at bottom right, rgba(120,80,40,0.25), transparent 55%)",
            backgroundSize: isDailyProphet ? "22px 22px, cover" : "cover",
            fontFamily: "MedievalSharp, Garamond, Georgia, serif",
          }}
        >
          <button
            type="button"
            className="absolute right-5 top-5 text-[32px] text-[#2a160c] transition hover:-translate-y-[1px] hover:text-[#4a2a14]"
            onClick={() => setActiveItem(null)}
            aria-label="Cerrar contenido"
          >
            ×
          </button>

          {isDailyProphet && (
            <>
              <div className="border-b-2 border-[#1f140c] pb-3 text-center">
                <p className="text-[11px] uppercase tracking-[3px] text-[#2a160c]">
                  The Wizard World&apos;s Beguiling Broadsheet of Choice
                </p>
                <h2 className="text-[40px] font-bold uppercase tracking-[4px] text-[#1a0f09]">
                  Daily Prophet
                </h2>
                <div className="mt-1 flex flex-wrap justify-center gap-4 text-[11px] uppercase tracking-[2px] text-[#2a160c]">
                  <span>Edicion especial</span>
                  <span>Noticias del reino</span>
                  <span>Precio 1 galeon</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-b border-[#1f140c] pb-4 text-[11px] uppercase tracking-[2px] text-[#1f140c] sm:grid-cols-3">
                <div className="border border-[#1f140c] px-3 py-2 text-center">
                  National Weather
                </div>
                <div className="border border-[#1f140c] px-3 py-2 text-center">
                  Zodiac Aspects
                </div>
                <div className="border border-[#1f140c] px-3 py-2 text-center">
                  Ministry Notices
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_2fr_1.2fr]">
                <div className="space-y-4 text-[12px] uppercase tracking-[1px] text-[#1f140c]">
                  <div className="border border-[#1f140c] px-3 py-2 text-center font-bold">
                    Exclusivo
                  </div>
                  <p className="text-[12px] leading-relaxed normal-case">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    vitae nisi sed diam luctus congue. Etiam consequat libero ut
                    varius auctor.
                  </p>
                  <p className="text-[12px] leading-relaxed normal-case">
                    Pellentesque habitant morbi tristique senectus et netus et
                    malesuada fames ac turpis egestas.
                  </p>
                  <div className="border border-[#1f140c] px-3 py-2 text-center font-bold">
                    Alertas del Reino
                  </div>
                  <p className="text-[12px] leading-relaxed normal-case">
                    Nulla facilisi. Duis nec felis sed odio cursus lacinia.
                  </p>
                </div>

                <div className="space-y-4 text-[#1a0f09]">
                  <h3 className="border-b border-[#1f140c] pb-2 text-[30px] font-extrabold uppercase tracking-[2px]">
                    The Boy Who Lies?
                  </h3>
                  <div className="rounded-[6px] border-2 border-[#1f140c] bg-[rgba(255,255,255,0.55)] p-3">
                    <img
                      src="/escudo.png"
                      alt="Retrato del heroe"
                      className="h-[190px] w-full object-contain"
                    />
                  </div>
                  <div className="text-[13px] leading-relaxed [column-count:2] [column-gap:18px]">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                      vitae nisi sed diam luctus congue. Etiam consequat, libero ut
                      varius auctor, elit tellus sodales est, non hendrerit purus
                      neque vitae erat.
                    </p>
                    <p>
                      Nullam consequat, nisl in aliquet cursus, neque sem fermentum
                      lectus, in interdum turpis ipsum vitae sapien. Integer quis
                      nulla sed metus placerat tempus. Praesent sagittis, lorem a
                      eleifend facilisis, ligula nisl fermentum lacus, in blandit
                      nisl tortor vel nibh.
                    </p>
                    <p>
                      Vivamus semper odio at luctus aliquet. Curabitur aliquet, leo
                      quis ultrices finibus, est erat pharetra augue, nec gravida
                      neque elit non arcu.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-[12px] text-[#1f140c]">
                  <div className="border border-[#1f140c] px-3 py-2 text-center uppercase tracking-[1px]">
                    Wizard Prison Blunder
                  </div>
                  <p className="leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    vitae nisi sed diam luctus congue.
                  </p>
                  <div className="border border-[#1f140c] px-3 py-2 text-center uppercase tracking-[1px]">
                    Ghosts Demand Housing
                  </div>
                  <p className="leading-relaxed">
                    Pellentesque habitant morbi tristique senectus et netus.
                  </p>
                  <div className="border border-[#1f140c] px-3 py-2 text-center uppercase tracking-[1px]">
                    Witch Wonder
                  </div>
                  <p className="leading-relaxed">
                    Praesent sagittis, lorem a eleifend facilisis, ligula nisl
                    fermentum lacus.
                  </p>
                  <div className="rounded-[6px] border border-[#1f140c] bg-[rgba(255,255,255,0.6)] p-3 text-center uppercase tracking-[1px]">
                    <img
                      src="/sword.svg"
                      alt="Espada medieval"
                      className="mx-auto mb-2 h-[120px] w-auto object-contain"
                    />
                    Reliquia de la guardia
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t-2 border-[#1f140c] pt-4 text-[12px] uppercase tracking-[2px] text-[#1f140c]">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="border border-[#1f140c] px-3 py-2 text-center">
                    anuncios
                  </div>
                  <div className="border border-[#1f140c] px-3 py-2 text-center">
                    clasificados
                  </div>
                  <div className="border border-[#1f140c] px-3 py-2 text-center">
                    cartas
                  </div>
                  <div className="border border-[#1f140c] px-3 py-2 text-center">
                    eventos
                  </div>
                </div>
                <p className="mt-3 text-center text-[10px] uppercase tracking-[2px] text-[#2a160c]">
                  Reporte especial - pagina 4/8
                </p>
              </div>
            </>
          )}
        </div>
      </section>

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
            {menuItems.map((item, index) => (
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
