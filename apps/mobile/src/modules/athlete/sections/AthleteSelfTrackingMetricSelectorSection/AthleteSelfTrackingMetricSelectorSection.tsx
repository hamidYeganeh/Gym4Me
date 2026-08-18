import { Button } from "@heroui/react/button";
import { athleteSelfTrackingMetricSelectorSectionVariants } from "./AthleteSelfTrackingMetricSelectorSection.styles";
import type { AthleteSelfTrackingMetricSelectorSectionProps } from "./AthleteSelfTrackingMetricSelectorSection.types";

export function AthleteSelfTrackingMetricSelectorSection({
  catalog,
  selectedKey,
  onSelect,
  className,
}: AthleteSelfTrackingMetricSelectorSectionProps) {
  const styles = athleteSelfTrackingMetricSelectorSectionVariants();

  return (
    <div className={styles.root({ className })}>
      {catalog.map((metric) => (
        <Button
          className={styles.metricButton()}
          key={metric.key}
          onPress={() => onSelect(metric.key)}
          variant={selectedKey === metric.key ? "primary" : "outline"}
        >
          {metric.label}
        </Button>
      ))}
    </div>
  );
}
