import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";

interface CountryOption {
  value?: string;
  label: string;
}

interface CustomCountrySelectProps {
  value?: string;
  options: CountryOption[];
  onChange: (value?: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  tabIndex?: number;
  iconComponent?: React.ComponentType<{ country?: string; label?: string }>;
}

export default function CustomCountrySelect({
  value,
  options,
  onChange,
  onFocus,
  onBlur,
  disabled,
  readOnly,
  iconComponent: Icon,
}: CustomCountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: "fixed",
    top: -9999,
    left: -9999,
    visibility: "hidden",
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panelWidth = Math.min(280, window.innerWidth - 24);
    const left = Math.min(
      Math.max(rect.left, 12),
      window.innerWidth - panelWidth - 12,
    );
    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width: panelWidth,
      visibility: "visible",
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedTrigger = wrapperRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);
      if (!clickedTrigger && !clickedPanel) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      searchRef.current?.focus();
      const selectedEl = listRef.current?.querySelector(
        '[data-selected="true"]',
      ) as HTMLElement | null;
      selectedEl?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled || readOnly) return;
    if (!isOpen) {
      updatePosition();
      onFocus?.();
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue?: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch("");
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearch("");
      onBlur?.();
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(normalizedSearch),
  );

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative h-full" ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className="flex items-center gap-[7px] h-full pl-[18px] pr-3.5 bg-transparent border-none cursor-pointer transition-colors duration-200 hover:bg-[rgba(13,44,92,0.04)] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedOption?.label || "Selectează țara"}
      >
        <span className="flex items-center w-6 h-[18px] rounded-sm overflow-hidden shadow-[0_0_0_1px_rgba(15,30,54,0.1)] [&_svg]:w-full [&_svg]:h-full [&_svg]:object-cover [&_svg]:block [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block">
          {Icon && <Icon country={value} label={selectedOption?.label} />}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-[#8595aa] shrink-0 transition-transform duration-[250ms] ${isOpen ? "rotate-180 text-[#1e4d8c]" : ""}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="bg-white border border-[#e1e8f0] rounded-[10px] shadow-[0_12px_32px_rgba(15,30,54,0.14)] z-[1000] overflow-hidden animate-[fadeIn_0.16s_ease-out]"
            style={panelStyle}
            role="listbox"
            ref={panelRef}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-2 py-2.5 px-3.5 border-b border-[#e1e8f0] text-[#8595aa]">
              <Search size={14} strokeWidth={2} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută țara..."
                autoComplete="off"
                className="border-none outline-none bg-transparent font-sans text-[13.5px] text-[#1a1a1a] w-full py-0.5 placeholder:text-[#8595aa]"
              />
            </div>

            <div
              className="max-h-60 overflow-y-auto p-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#e1e8f0] [&::-webkit-scrollbar-thumb]:rounded-sm"
              ref={listRef}
            >
              {filteredOptions.length === 0 && (
                <div className="py-4 px-2.5 text-center text-[13px] text-[#8595aa]">
                  Nicio țară găsită.
                </div>
              )}

              {filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value ?? "international"}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-selected={isSelected || undefined}
                    className={`flex items-center gap-2.5 w-full py-2 px-2.5 border-none rounded text-left font-sans text-[13.5px] text-[#1a1a1a] cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? "bg-[rgba(13,44,92,0.08)] font-semibold"
                        : "bg-transparent hover:bg-[rgba(13,44,92,0.06)]"
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="flex items-center w-[22px] h-4 rounded-sm overflow-hidden shadow-[0_0_0_1px_rgba(15,30,54,0.1)] shrink-0 [&_svg]:w-full [&_svg]:h-full [&_svg]:object-cover [&_img]:w-full [&_img]:h-full [&_img]:object-cover">
                      {Icon && (
                        <Icon country={option.value} label={option.label} />
                      )}
                    </span>
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
