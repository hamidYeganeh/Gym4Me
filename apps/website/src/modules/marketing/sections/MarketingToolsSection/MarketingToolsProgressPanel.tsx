import type { CSSProperties } from "react";
import {
  MarketingToolPanelHead,
  type MarketingToolItem,
} from "./MarketingToolsSectionHeader";

export function MarketingToolsProgressPanel({
  item,
}: {
  item: MarketingToolItem;
}) {
  return (
    <div className="c-tool -progress" data-scroll="" data-scroll-offset="5%">
      <div className="o-container">
        <MarketingToolPanelHead item={item} />
      </div>

      <div
        className="c-tool_playground"
        style={{ "--container-ratio": "12/5" } as CSSProperties}
      >
        {(["-2", "-1", "0", "1", "2"] as const).map((index, panelIndex) => (
          <div
            key={index}
            className={`c-tool_shape -${["first", "second", "third", "fourth", "fifth"][panelIndex]}`}
            style={{ "--index": index } as CSSProperties}
            data-scroll=""
            data-scroll-css-progress=""
          >
            <div className="c-tool_shape_inner">
              <span className="o-icon c-tool_shape_svg ">
                <svg
                  className={`svg-progress-0${panelIndex + 1}`}
                  focusable="false"
                  aria-hidden={true}
                >
                  <use
                    href={`/assets/images/sprite.svg#progress-0${panelIndex + 1}`}
                  ></use>
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
