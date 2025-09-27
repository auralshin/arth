import { useMemo } from "react";

function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="mx-auto mt-12 max-w-6xl px-4 pb-10 text-center text-xs text-slate-400">
      © {year} Arth. Built by{" "}
      <span className="text-white">
        <a href="https://github.com/Auralshin">Auralshin</a>.
      </span>
    </footer>
  );
}

export default Footer;
