"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { discoverySearchTopicsSectionVariants } from "./DiscoverySearchTopicsSection.styles";
import type { DiscoverySearchTopicsSectionProps } from "./DiscoverySearchTopicsSection.types";

export function DiscoverySearchTopicsSection({
  topics,
  selectedTopicId,
  title,
  emptyLabel,
  topicAria,
  onSelect,
  className,
}: DiscoverySearchTopicsSectionProps) {
  const slots = discoverySearchTopicsSectionVariants();

  return (
    <section className={slots.root({ className })}>
      <Typography className={slots.title()} type="h4" weight="bold">
        {title}
      </Typography>

      {topics.length === 0 ? (
        <Typography className={slots.empty()} type="body-sm">
          {emptyLabel}
        </Typography>
      ) : (
        <div className={slots.list()} role="list">
          {topics.map((topic) => {
            const selected = topic.id === selectedTopicId;
            return (
              <div key={topic.id} role="listitem">
                <Button size="lg"
                  aria-label={topicAria(topic.label)}
                  aria-pressed={selected}
                  className={slots.topicButton()}
                  variant="ghost"
                  onPress={() => onSelect(topic)}
                >
                  <Chip
                    className={slots.chip()}
                    color={selected ? "accent" : "default"}
                    size="md"
                    variant={selected ? "primary" : "secondary"}
                  >
                    <Chip.Label># {topic.label}</Chip.Label>
                  </Chip>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
