import { useState } from "react";
import { AdminShell } from "@/shared/components";
import { BasicsSportsSection } from "../../sections/BasicsSportsSection";
import { sportsListScreenVariants } from "./SportsListScreen.styles";
import type { SportsListScreenProps } from "./SportsListScreen.types";

export function SportsListScreen({ className, kind }: SportsListScreenProps) {
  const styles = sportsListScreenVariants();
  const [searchInput, setSearchInput] = useState("");

  return (
    <AdminShell
      activeNavId="sports"
      className={className}
      sportsSection={{
        activeTabId: kind,
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <BasicsSportsSection key={kind} kind={kind} search={searchInput} />
      </div>
    </AdminShell>
  );
}
