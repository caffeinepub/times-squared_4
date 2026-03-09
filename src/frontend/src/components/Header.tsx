import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  onLogoClick: () => void;
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Header({ onMenuClick, onLogoClick }: HeaderProps) {
  return (
    <header className="w-full px-5 md:px-10 pt-6 pb-4">
      <div className="flex items-start justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={onLogoClick}
          className="text-left focus:outline-none group"
          aria-label="Go to homepage"
        >
          <h1
            className="font-editorial font-black text-white leading-none select-none tracking-tight"
            style={{ fontSize: "clamp(3.5rem, 10vw, 6rem)" }}
          >
            TIMES
            <sup
              className="text-[0.4em] align-super font-black"
              style={{ verticalAlign: "super", fontSize: "0.4em" }}
            >
              ²
            </sup>
          </h1>
          <p
            className="font-sans text-white/50 mt-1"
            style={{ fontSize: "12px", fontWeight: 300 }}
          >
            {formatCurrentDate()}
          </p>
        </button>

        {/* Hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="mt-1 p-2 text-white hover:opacity-60 transition-opacity focus:outline-none"
          aria-label="Open navigation menu"
          data-ocid="nav.open_modal_button"
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* Divider */}
      <div className="mt-4 border-t border-white" />
    </header>
  );
}
