import { useRef } from "react";

import type { LucideIcon } from "lucide-react";

import {
  BriefcaseBusiness,
  CalendarDays,
  Grid2X2,
  Laptop,
  Mic2,
  Palette,
  RotateCcw,
  Search,
  Shirt,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import type { MarketplaceCategory } from "~/src/types/marketplace";

interface MarketplaceHeaderProps {
  categories: MarketplaceCategory[];

  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;

  query: string;
  onQueryChange: (value: string) => void;

  minPrice: string;
  maxPrice: string;

  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;

  onReset: () => void;
}

const CATEGORY_ICON_RULES: Array<{
  pattern: RegExp;
  icon: LucideIcon;
}> = [
  {
    pattern: /creative|studio|design|desain/i,
    icon: Palette,
  },
  {
    pattern: /tech|digital|technology|it/i,
    icon: Laptop,
  },
  {
    pattern: /event/i,
    icon: CalendarDays,
  },
  {
    pattern: /talent|performer|music|entertain/i,
    icon: Mic2,
  },
  {
    pattern: /merch|apparel|fashion/i,
    icon: Shirt,
  },
  {
    pattern: /consumption|food|drink|catering/i,
    icon: UtensilsCrossed,
  },
];

function getCategoryIcon(name: string): LucideIcon {
  const match = CATEGORY_ICON_RULES.find((item) => item.pattern.test(name));

  return match?.icon ?? BriefcaseBusiness;
}

export default function MarketplaceHeader({
  categories,
  selectedCategoryId,
  onSelectCategory,
  query,
  onQueryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}: MarketplaceHeaderProps) {
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  function handleCategoryMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const container = categoryScrollRef.current;

    if (!container) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false,
    };

    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  }

  function handleCategoryMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const container = categoryScrollRef.current;

    if (!container || !dragStateRef.current.isDragging) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;

    if (Math.abs(deltaX) > 4) {
      dragStateRef.current.moved = true;
    }

    container.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
  }

  function stopCategoryDragging() {
    const container = categoryScrollRef.current;

    dragStateRef.current.isDragging = false;

    if (container) {
      container.style.cursor = "grab";
      container.style.userSelect = "";
    }
  }

  function handleCategoryWheel(event: React.WheelEvent<HTMLDivElement>) {
    const container = categoryScrollRef.current;

    if (!container) {
      return;
    }

    const canScroll = container.scrollWidth > container.clientWidth;

    if (!canScroll) {
      return;
    }

    /**
     * Mouse wheel vertikal diubah
     * menjadi horizontal.
     *
     * Trackpad yang memang menghasilkan
     * deltaX juga tetap didukung.
     */
    const movement =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    container.scrollLeft += movement;

    event.preventDefault();
  }

  function selectCategory(categoryId: number | null) {
    /**
     * Kalau user baru saja drag,
     * jangan menganggap mouse-up
     * sebagai click kategori.
     */
    if (dragStateRef.current.moved) {
      dragStateRef.current.moved = false;
      return;
    }

    onSelectCategory(categoryId);
  }

  return (
    <section className="overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-10 md:px-12 md:pb-10 md:pt-14">
        {/* Hero Copy */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Temukan layanan yang tepat
            <span className="block text-blue-600">
              untuk setiap kebutuhanmu
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Jelajahi layanan dari berbagai vendor, bandingkan harga, lalu pilih
            yang paling sesuai dengan proyekmu.
          </p>
        </div>

        {/* Global Categories */}
        <div className="mt-9 rounded-3xl border border-slate-200/80 bg-white p-2 shadow-lg shadow-blue-950/5">
          <div
            ref={categoryScrollRef}
            onMouseDown={handleCategoryMouseDown}
            onMouseMove={handleCategoryMouseMove}
            onMouseUp={stopCategoryDragging}
            onMouseLeave={stopCategoryDragging}
            onWheel={handleCategoryWheel}
            className="
      scrollbar-hidden
      flex
      cursor-grab
      gap-2
      overflow-x-auto
      overscroll-x-contain
      scroll-smooth
      select-none
    "
          >
            {/* Semua Layanan */}
            <button
              type="button"
              draggable={false}
              onClick={() => selectCategory(null)}
              className={[
                "flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-bold transition",
                selectedCategoryId === null
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
              ].join(" ")}
            >
              <Grid2X2 size={17} />
              Semua Layanan
            </button>

            {/* Global Category */}
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.name);

              const active = selectedCategoryId === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  draggable={false}
                  onClick={() => selectCategory(active ? null : category.id)}
                  className={[
                    "flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition",
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                  ].join(" ")}
                >
                  <Icon size={17} />

                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Horizontal Filter + Search */}
        <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-xl shadow-blue-950/5 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_170px_auto]">
            {/* Search */}
            <label className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
              <Search size={20} className="shrink-0 text-slate-400" />

              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cari layanan
                </span>

                <input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  type="search"
                  placeholder="Desain logo, website, event..."
                  className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            {/* Minimum Price */}
            <label className="flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
              <div className="w-full">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Harga minimum
                </span>

                <div className="mt-0.5 flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-400">Rp</span>

                  <input
                    value={minPrice}
                    onChange={(event) => onMinPriceChange(event.target.value)}
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>
            </label>

            {/* Maximum Price */}
            <label className="flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
              <div className="w-full">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Harga maksimum
                </span>

                <div className="mt-0.5 flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-400">Rp</span>

                  <input
                    value={maxPrice}
                    onChange={(event) => onMaxPriceChange(event.target.value)}
                    type="number"
                    min="0"
                    placeholder="Tanpa batas"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>
            </label>

            {/* Reset */}
            <button
              type="button"
              onClick={onReset}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <RotateCcw size={17} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
