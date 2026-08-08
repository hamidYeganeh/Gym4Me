import { useState } from "react";
import { AdminShell } from "@/shared/components";
import { BasicsRefsSection } from "../../sections/BasicsRefsSection";
import { refsListScreenVariants } from "./RefsListScreen.styles";
import type { RefsListScreenProps } from "./RefsListScreen.types";

export function RefsListScreen({ className, type }: RefsListScreenProps) {
  const styles = refsListScreenVariants();
  const [searchInput, setSearchInput] = useState("");

  return (
    <AdminShell
      activeNavId="refs"
      className={className}
      refsSection={{
        activeTabId: type,
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <BasicsRefsSection key={type} search={searchInput} type={type} />
      </div>
    </AdminShell>
  );
}
