import { useEffect, useRef } from "react";
import galleryContent from "../data/galleryContent";

export default function GalleryPanel({ frames, isLit, scrollRef }) {
  const rootRef = useRef(null);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const scrollEl = scrollRef?.current;
    const rootEl = rootRef.current;
    if (!scrollEl || !rootEl) return;

    const updateTorch = (clientX, clientY) => {
      const rect = scrollEl.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top + scrollEl.scrollTop;
      rootEl.style.setProperty("--gallery-torch-x", `${x}px`);
      rootEl.style.setProperty("--gallery-torch-y", `${y}px`);
    };

    const handleMouseMove = (event) => {
      lastMouseRef.current = { x: event.clientX, y: event.clientY };
      updateTorch(event.clientX, event.clientY);
    };

    const handleScroll = () => {
      updateTorch(lastMouseRef.current.x, lastMouseRef.current.y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    scrollEl.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      scrollEl.removeEventListener("scroll", handleScroll);
    };
  }, [scrollRef]);

  return (
    <div
      ref={rootRef}
      className="relative -mx-6 -my-8 sm:-mx-10 sm:-my-10 px-6 py-8 sm:px-10 sm:py-10"
    >
      <div
        className={`pointer-events-none absolute inset-0 z-10 ${
          isLit ? "gallery-torch" : "gallery-dark"
        }`}
      />
      <div className="relative z-0">
        <div className="border-b border-[rgba(190,170,140,0.28)] pb-4 text-center text-[#e2d2b8]">
          <p className="text-[11px] uppercase tracking-[3px] text-[rgba(190,170,140,0.55)]">
            {galleryContent.header.strapline}
          </p>
          <h2 className="text-[34px] font-bold uppercase tracking-[4px]">
            {galleryContent.header.title}
          </h2>
          <p className="mt-2 text-[12px] uppercase tracking-[2px] text-[rgba(190,170,140,0.65)]">
            {galleryContent.header.subtitle}
          </p>
        </div>

        <div className="mt-8 grid auto-rows-[120px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {frames.map((frame, index) => (
            <div
              key={`frame-${index}`}
              className={`gallery-frame ${frame.size}`}
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div
                className="h-full w-full bg-center bg-no-repeat shadow-[0_14px_24px_rgba(0,0,0,0.5)]"
                style={{
                  backgroundImage: "url('/frame.png')",
                  backgroundSize: "100% 100%",
                  padding: "12%",
                }}
              >
                <div className="h-full w-full rounded-[6px] bg-[#0d0a08] shadow-[inset_0_0_22px_rgba(0,0,0,0.7)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
