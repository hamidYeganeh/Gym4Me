import { useState } from "react";
import { AdminShell } from "@/shared/components";
import { BasicsLocationsSection } from "../../sections/BasicsLocationsSection";
import { locationsListScreenVariants } from "./LocationsListScreen.styles";
import type { LocationsListScreenProps } from "./LocationsListScreen.types";

export function LocationsListScreen({
  className,
  kind,
}: LocationsListScreenProps) {
  const styles = locationsListScreenVariants();
  const [searchInput, setSearchInput] = useState("");

  return (
    <AdminShell
      activeNavId="locations"
      className={className}
      locationsSection={{
        activeTabId: kind,
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <BasicsLocationsSection key={kind} kind={kind} search={searchInput} />
      </div>
    </AdminShell>
  );
}
