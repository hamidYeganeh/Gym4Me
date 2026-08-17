import type { CSSProperties } from "react";
import {
  MarketingToolPanelHead,
  type MarketingToolItem,
} from "./MarketingToolsSectionHeader";

export function MarketingToolsInviewPanel({ item }: { item: MarketingToolItem }) {
  return (
    <div className="c-tool -inview" data-scroll="" data-scroll-offset="5%">
      <div className="o-container">
        <MarketingToolPanelHead item={item} />
      </div>

      <div
        className="c-tool_playground"
        style={{ "--container-ratio": "7/5" } as CSSProperties}
      >
        <div
          className="c-tool_shape -first"
          data-scroll=""
          data-scroll-offset="10%"
          data-scroll-repeat=""
        >
          <div
            className="c-tool_shape_inner"
            data-scroll=""
            data-scroll-speed="0.01"
            data-scroll-css-progress=""
          >
            <span className="o-icon c-tool_shape_svg ">
              <svg className="svg-inview-01" focusable="false" aria-hidden={true}>
                <use href="/assets/images/sprite.svg#inview-01"></use>
              </svg>
            </span>
          </div>
        </div>
        <div
          className="c-tool_shape -second"
          data-scroll=""
          data-scroll-offset="30%"
          data-scroll-repeat=""
        >
          <div
            className="c-tool_shape_inner"
            data-scroll=""
            data-scroll-speed="0.1"
          >
            <span className="o-icon c-tool_shape_svg ">
              <svg className="svg-inview-02" focusable="false" aria-hidden={true}>
                <use href="/assets/images/sprite.svg#inview-02"></use>
              </svg>
            </span>
          </div>
        </div>
        <div
          className="c-tool_shape -third"
          data-scroll=""
          data-scroll-offset="25%"
          data-scroll-repeat=""
        >
          <div
            className="c-tool_shape_inner"
            data-scroll=""
            data-scroll-speed="0.02"
          >
            <span className="o-icon c-tool_shape_svg ">
              <svg className="svg-inview-03" focusable="false" aria-hidden={true}>
                <use href="/assets/images/sprite.svg#inview-03"></use>
              </svg>
            </span>
          </div>
        </div>
        <div
          className="c-tool_shape -fourth"
          data-scroll=""
          data-scroll-offset="45%"
          data-scroll-repeat=""
        >
          <div
            className="c-tool_shape_inner"
            data-scroll=""
            data-scroll-speed="0.05"
          >
            <span className="o-icon c-tool_shape_svg ">
              <svg className="svg-inview-04" focusable="false" aria-hidden={true}>
                <use href="/assets/images/sprite.svg#inview-04"></use>
              </svg>
            </span>
          </div>
        </div>
        <div
          className="c-tool_shape -fifth"
          data-scroll=""
          data-scroll-offset="20%"
          data-scroll-repeat=""
        >
          <div
            className="c-tool_shape_inner"
            data-scroll=""
            data-scroll-speed="0.15"
            data-scroll-css-progress=""
          >
            <span className="o-icon c-tool_shape_svg ">
              <svg className="svg-inview-05" focusable="false" aria-hidden={true}>
                <use href="/assets/images/sprite.svg#inview-05"></use>
              </svg>
            </span>
          </div>
        </div>
        <div
          className="c-tool_shape -sixth"
          data-scroll=""
          data-scroll-offset="60%"
          data-scroll-repeat=""
        >
          <div
            className="c-tool_shape_inner"
            data-scroll=""
            data-scroll-speed="0.05"
          >
            <span className="o-icon c-tool_shape_svg ">
              <svg className="svg-inview-06" focusable="false" aria-hidden={true}>
                <use href="/assets/images/sprite.svg#inview-06"></use>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
