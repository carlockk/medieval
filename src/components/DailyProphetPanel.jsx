import dailyProphetContent from "../data/dailyProphetContent";

export default function DailyProphetPanel() {
  const {
    masthead,
    infoBoxes,
    leftColumn,
    mainStory,
    rightColumn,
    relic,
    footer,
  } = dailyProphetContent;

  return (
    <>
      <div className="border-b-2 border-[#1f140c] pb-3 text-center">
        <p className="text-[11px] uppercase tracking-[3px] text-[#2a160c]">
          {masthead.strapline}
        </p>
        <h2 className="text-[40px] font-bold uppercase tracking-[4px] text-[#1a0f09]">
          {masthead.title}
        </h2>
        <div className="mt-1 flex flex-wrap justify-center gap-4 text-[11px] uppercase tracking-[2px] text-[#2a160c]">
          {masthead.meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-b border-[#1f140c] pb-4 text-[11px] uppercase tracking-[2px] text-[#1f140c] sm:grid-cols-3">
        {infoBoxes.map((item) => (
          <div key={item} className="border border-[#1f140c] px-3 py-2 text-center">
            {item}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_2fr_1.2fr]">
        <div className="space-y-4 text-[12px] uppercase tracking-[1px] text-[#1f140c]">
          {leftColumn.sections.map((section) => (
            <div key={section.title}>
              <div className="border border-[#1f140c] px-3 py-2 text-center font-bold">
                {section.title}
              </div>
              <p className="mt-4 text-[12px] leading-relaxed normal-case">
                {section.text}
              </p>
            </div>
          ))}
          <p className="text-[12px] leading-relaxed normal-case">
            {leftColumn.extra}
          </p>
        </div>

        <div className="space-y-4 text-[#1a0f09]">
          <h3 className="border-b border-[#1f140c] pb-2 text-[30px] font-extrabold uppercase tracking-[2px]">
            {mainStory.title}
          </h3>
          <div className="rounded-[6px] border-2 border-[#1f140c] bg-[rgba(255,255,255,0.55)] p-3">
            <img
              src={mainStory.image.src}
              alt={mainStory.image.alt}
              className="h-[190px] w-full object-contain"
            />
          </div>
          <div className="text-[13px] leading-relaxed [column-count:2] [column-gap:18px]">
            {mainStory.paragraphs.map((paragraph, index) => (
              <p key={`${mainStory.title}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="space-y-4 text-[12px] text-[#1f140c]">
          {rightColumn.map((item) => (
            <div key={item.title}>
              <div className="border border-[#1f140c] px-3 py-2 text-center uppercase tracking-[1px]">
                {item.title}
              </div>
              <p className="leading-relaxed">{item.text}</p>
            </div>
          ))}
          <div className="rounded-[6px] border border-[#1f140c] bg-[rgba(255,255,255,0.6)] p-3 text-center uppercase tracking-[1px]">
            <img
              src={relic.image.src}
              alt={relic.image.alt}
              className="mx-auto mb-2 h-[120px] w-auto object-contain"
            />
            {relic.caption}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t-2 border-[#1f140c] pt-4 text-[12px] uppercase tracking-[2px] text-[#1f140c]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {footer.labels.map((label) => (
            <div key={label} className="border border-[#1f140c] px-3 py-2 text-center">
              {label}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] uppercase tracking-[2px] text-[#2a160c]">
          {footer.note}
        </p>
      </div>
    </>
  );
}
