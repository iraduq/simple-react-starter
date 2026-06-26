import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";

// Props-urile pe care react-phone-number-input le transmite automat
// componentei custom date prin `countrySelectComponent`.
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

  // Calculează poziția panoului față de fereastră (nu față de container),
  // pentru că panoul e randat printr-un portal direct în <body> — astfel
  // scapă de orice `overflow: hidden` pus pe părinții căsuței de telefon.
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

  // useLayoutEffect (nu useEffect) — rulează sincron, înainte ca browserul
  // să picteze ecranul, ca să nu existe niciun cadru vizibil în care panoul
  // n-are încă poziție corectă.
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

  // Închide panoul la click în afara lui — verificăm atât trigger-ul cât
  // și panoul (care, fiind portal, nu mai e descendent DOM al wrapper-ului).
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

  // Focus automat pe câmpul de căutare când se deschide panoul
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
      // Calculăm poziția SINCRON, în același handler de click, înainte de
      // a deschide panoul. React grupează acest setState cu setIsOpen(true)
      // în același re-render, deci panoul nu mai apare niciodată "fără
      // poziție" — eliminăm flash-ul/saltul de pagină de la prima randare.
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
    <div className="country-select-wrapper" ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className="country-select-trigger"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedOption?.label || "Selectează țara"}
      >
        <span className="country-select-flag">
          {Icon && <Icon country={value} label={selectedOption?.label} />}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`country-select-chevron ${isOpen ? "is-open" : ""}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="country-select-panel"
            style={panelStyle}
            role="listbox"
            ref={panelRef}
            onKeyDown={handleKeyDown}
          >
            <div className="country-select-search">
              <Search size={14} strokeWidth={2} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută țara..."
                autoComplete="off"
              />
            </div>

            <div className="country-select-list" ref={listRef}>
              {filteredOptions.length === 0 && (
                <div className="country-select-empty">Nicio țară găsită.</div>
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
                    className={`country-select-option ${isSelected ? "is-selected" : ""}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="country-select-option-flag">
                      {Icon && (
                        <Icon country={option.value} label={option.label} />
                      )}
                    </span>
                    <span className="country-select-option-label">
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
