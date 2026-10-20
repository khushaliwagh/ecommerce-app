export default function Footer() {
  return (
    <footer className="overflow-hidden bg-primary text-primary-foreground">
      <div className="container pb-8 pt-4">
        <p
          aria-hidden="true"
          className="select-none font-display text-[clamp(6rem,26vw,22rem)] font-extrabold leading-[0.8] tracking-[-0.06em] text-primary-foreground/10"
        >
          Drift
        </p>
        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-primary-foreground/15 pt-6 text-sm text-primary-foreground/60 sm:flex-row">
          <p>Demo project — no payments are processed and no goods are shipped.</p>
          <p>
            React · Redux Toolkit · Tailwind · Shadcn/ui · Spring Boot · MySQL ·{' '}
            <a href="#/admin" className="font-semibold text-primary-foreground/80 underline-offset-4 hover:underline">
              Admin
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
