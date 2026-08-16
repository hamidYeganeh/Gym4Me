import { tv } from "tailwind-variants";

export const marketingDownloadSectionStyles = tv({
  slots: {
    root: "landing-download relative flex h-svh w-full max-w-[100vw] items-center justify-center overflow-hidden bg-accent font-sans text-foreground antialiased selection:bg-foreground selection:text-accent-foreground",
    grain: "film-grain",
    grid: "hero-grid pointer-events-none absolute inset-0 z-0 bg-accent-foreground",
    heroText:
      "hero-text-wrapper transform-style-3d absolute z-10 flex w-full flex-col items-center justify-center px-4 text-center will-change-transform",
    tagline:
      "text-track hero-display-shadow mb-1 text-[clamp(1.75rem,8vw,6rem)] tracking-tighter text-foreground sm:mb-2 sm:text-4xl md:text-7xl lg:text-[6rem]",
    tagline2:
      "text-days hero-display-shadow text-[clamp(1.5rem,7vw,6rem)] tracking-tighter text-foreground sm:text-3xl md:text-7xl lg:text-[6rem]",
    ctaWrapper:
      "cta-wrapper gsap-reveal pointer-events-auto absolute z-10 flex h-full w-full flex-col items-center justify-center bg-accent-foreground px-4 text-center will-change-transform",
    ctaHeading:
      "hero-display-shadow mb-4 text-[clamp(1.75rem,7vw,3.75rem)] tracking-tighter text-foreground sm:mb-6 md:text-5xl lg:text-6xl",
    ctaDescription:
      "mx-auto mb-8 max-w-xl text-sm leading-relaxed text-foreground/80 sm:mb-12 sm:text-lg md:text-xl",
    storeRow:
      "mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4",
    storeButton:
      "group h-auto w-full justify-center gap-3 rounded-full border border-foreground bg-foreground px-6 py-3.5 text-accent-foreground transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-foreground/90 sm:w-auto sm:min-w-[11.5rem] sm:px-8 sm:py-4",
    storeIcon:
      "h-8 w-8 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105",
    storeIconPlay:
      "h-7 w-7 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105",
    storeKicker: "-mb-0.5 tracking-wider opacity-70",
    storeTitle: "text-xl leading-none tracking-tight",
    cardLayer:
      "pointer-events-none absolute inset-0 z-20 flex items-center justify-center",
    mainCard:
      "main-card premium-depth-card gsap-reveal pointer-events-auto relative flex h-[90svh] w-[94vw] items-center justify-center overflow-hidden rounded-[28px] sm:h-[92vh] sm:w-[92vw] sm:rounded-[32px] md:h-[85vh] md:w-[85vw] md:rounded-[40px]",
    sheen: "card-sheen",
    cardInner:
      "relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col items-center justify-center gap-3 px-3 py-4 sm:justify-evenly sm:gap-0 sm:px-4 sm:py-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:px-12 lg:py-0",
    brandName:
      "text-4xl tracking-tighter text-foreground sm:text-6xl md:text-[6rem] lg:mt-0 lg:text-[8rem]",
    mockupWrap:
      "mockup-scroll-wrapper relative order-2 z-10 flex h-[300px] w-full items-center justify-center sm:h-[380px] lg:order-2 lg:h-[600px]",
    mockupScale:
      "relative flex h-full w-full scale-[0.52] items-center justify-center min-[400px]:scale-[0.58] sm:scale-[0.65] md:scale-[0.85] lg:scale-100",
    bezel:
      "iphone-bezel relative flex h-[580px] w-[280px] flex-col rounded-[3rem] will-change-transform",
    hardwareBtn: "hardware-btn absolute z-0 w-[3px]",
    screen: "phone-screen absolute inset-[7px] z-10 overflow-hidden rounded-[2.5rem]",
    glare: "screen-glare pointer-events-none absolute inset-0 z-40",
    notch:
      "absolute top-[5px] left-1/2 z-50 flex h-[28px] w-[100px] -translate-x-1/2 items-center justify-start rounded-full bg-accent-foreground px-3",
    notchDot: "h-1.5 w-1.5 animate-pulse rounded-full bg-foreground",
    screenInner: "relative flex h-full w-full flex-col px-5 pt-12 pb-8",
    phoneHeader: "phone-widget mb-8 flex items-center justify-between",
    avatar:
      "h-9 w-9 rounded-full border border-foreground/10 bg-foreground/5 text-sm font-bold text-foreground",
    ringWrap: "phone-widget relative mx-auto mb-8 flex h-44 w-44 items-center justify-center",
    ringSvg: "absolute inset-0 h-full w-full",
    counter: "counter-val text-4xl tracking-tighter text-foreground",
    widget:
      "phone-widget widget-depth h-auto justify-start gap-3 rounded-2xl p-3",
    widgetIcon:
      "flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/15",
    widgetIconMuted:
      "flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/25 bg-foreground/15",
    homeIndicator:
      "absolute bottom-2 left-1/2 h-1 w-[120px] -translate-x-1/2 rounded-full bg-foreground/20",
    floatingBadge:
      "floating-badge floating-ui-badge absolute z-30 hidden items-center gap-2 rounded-xl p-2.5 min-[480px]:flex sm:gap-3 sm:p-3 lg:gap-4 lg:rounded-2xl lg:p-4",
    badgeIcon:
      "flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 lg:h-10 lg:w-10",
    copyCol:
      "card-left-text gsap-reveal order-3 z-20 flex w-full flex-col justify-center px-2 text-center sm:px-4 lg:order-1 lg:max-w-none lg:px-0 lg:text-start",
    cardHeading:
      "mb-0 text-xl tracking-tight text-foreground sm:text-2xl md:text-3xl lg:mb-5 lg:text-4xl",
    cardDescription:
      "mx-auto mt-1 line-clamp-2 max-w-sm text-xs leading-relaxed text-foreground/90 sm:mt-2 sm:text-sm md:line-clamp-none md:text-base lg:mx-0 lg:max-w-none lg:text-lg",
    brandCol:
      "card-right-text gsap-reveal order-1 z-20 flex w-full justify-center lg:order-3 lg:justify-end",
  },
});
