import { useState } from "react";
import { AdminShell } from "@/shared/components";
import { BasicsChoicesSection } from "../../sections/BasicsChoicesSection";
import { choicesListScreenVariants } from "./ChoicesListScreen.styles";
import type { ChoicesListScreenProps } from "./ChoicesListScreen.types";

export function ChoicesListScreen({ className }: ChoicesListScreenProps) {
  const styles = choicesListScreenVariants();
  const [searchInput, setSearchInput] = useState("");

  return (
    <AdminShell
      activeNavId="choices"
      choicesSection={{
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
      className={className}
    >
      <div className={styles.content()}>
        <BasicsChoicesSection search={searchInput} />
      </div>
    </AdminShell>
  );
}
