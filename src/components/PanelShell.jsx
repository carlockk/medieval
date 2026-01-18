export default function PanelShell({
  active,
  isGallery,
  isHorizontal,
  onClose,
  variant,
  contentRef,
  children,
}) {
  const isDaily = variant === "daily";
  const isGalleryVariant = variant === "gallery";
  const background = isDaily
    ? "linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px), radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 60%)"
    : isGalleryVariant
    ? "radial-gradient(circle at top, rgba(88,120,160,0.35), transparent 55%), radial-gradient(circle at bottom, rgba(20,10,5,0.55), transparent 65%)"
    : "radial-gradient(circle at top left, rgba(255,255,255,0.5), transparent 60%), radial-gradient(circle at bottom right, rgba(120,80,40,0.25), transparent 55%)";
  const backgroundSize = isDaily ? "22px 22px, cover" : "cover";

  return (
    <section
      className={`fixed z-30 text-[#22150b] transition duration-300 ease-out ${
        active
          ? "translate-x-0 opacity-100 pointer-events-auto"
          : "translate-x-full opacity-0 pointer-events-none"
      }`}
      style={{
        top: isHorizontal ? "40px" : 0,
        bottom: 0,
        left: 0,
        right: isHorizontal ? 0 : "var(--panel-offset)",
        width: isHorizontal ? "100%" : "calc(100% - var(--panel-offset))",
      }}
    >
      <div
        ref={contentRef}
        className={`panel-scroll relative h-full w-full overflow-y-auto border-l border-[rgba(120,80,40,0.45)] px-6 py-8 sm:border-l sm:px-10 sm:py-10 ${
          isDaily
            ? "bg-[#e9d7b8]"
            : isGalleryVariant
            ? "bg-[#102033]"
            : "bg-[#ead9ba] shadow-[inset_0_0_40px_rgba(90,50,20,0.35)]"
        }`}
        style={{
          backgroundImage: background,
          backgroundSize,
          fontFamily: "MedievalSharp, Garamond, Georgia, serif",
        }}
      >
        <button
          type="button"
          className={`absolute right-5 top-5 z-20 pointer-events-auto text-[32px] transition hover:-translate-y-[1px] ${
            isGallery ? "text-[#e7d4b4] hover:text-[#f3e6d2]" : "text-[#2a160c] hover:text-[#4a2a14]"
          }`}
          onClick={onClose}
          aria-label="Cerrar contenido"
        >
          ×
        </button>

        {children}
      </div>
    </section>
  );
}
