import type { ComponentType } from "react";
import type { IconProps } from "./create-icon";

const cache = new Map<string, ComponentType<IconProps>>();

function isComponent(
  value: unknown,
): value is ComponentType<IconProps> {
  if (typeof value === "function") return true;
  // forwardRef / memo exotic components
  return (
    typeof value === "object" &&
    value !== null &&
    "$$typeof" in value
  );
}

/**
 * Lazily load a single icon component by PascalCase name (e.g. `"Plus"`).
 * Results are cached so the picker grid can remount cells cheaply.
 */
export async function loadIcon(
  name: string,
): Promise<ComponentType<IconProps> | null> {
  const cached = cache.get(name);
  if (cached) return cached;

  try {
    const mod = (await import(`./icons/${name}.tsx`)) as Record<
      string,
      unknown
    >;
    const Comp = mod[name];
    if (!isComponent(Comp)) return null;
    cache.set(name, Comp);
    return Comp;
  } catch {
    return null;
  }
}

export function getCachedIcon(
  name: string,
): ComponentType<IconProps> | undefined {
  return cache.get(name);
}
