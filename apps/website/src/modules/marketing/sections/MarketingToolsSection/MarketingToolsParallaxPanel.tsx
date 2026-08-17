import type { CSSProperties } from "react";
import {
  MarketingToolPanelHead,
  type MarketingToolItem,
} from "./MarketingToolsSectionHeader";

const PARALLAX_SHAPES = [
  { className: "-first", speed: "0.04", sprite: "parallax-01" },
  { className: "-second", speed: "0.2", sprite: "parallax-02" },
  { className: "-third", speed: "0.3", sprite: "parallax-03" },
  { className: "-fourth", speed: "0.15", sprite: "parallax-04" },
  { className: "-fifth", speed: "0.25", sprite: "parallax-05" },
] as const;

export function MarketingToolsParallaxPanel({
  item,
}: {
  item: MarketingToolItem;
}) {
  return (
    <div className="c-tool -parallax" data-scroll="" data-scroll-offset="5%">
      <div className="o-container">
        <MarketingToolPanelHead item={item} />
      </div>

      <div
        className="c-tool_playground"
        style={{ "--container-ratio": "10/5" } as CSSProperties}
      >
        {PARALLAX_SHAPES.map((shape) => (
          <div key={shape.sprite} className={`c-tool_shape ${shape.className}`}>
            <div
              className="c-tool_shape_inner"
              data-scroll=""
              data-scroll-speed={shape.speed}
              data-scroll-enable-touch-speed=""
            >
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className={`svg-${shape.sprite}`}
                  focusable="false"
                  aria-hidden={true}
                >
                  <use href={`/assets/images/sprite.svg#${shape.sprite}`}></use>
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
