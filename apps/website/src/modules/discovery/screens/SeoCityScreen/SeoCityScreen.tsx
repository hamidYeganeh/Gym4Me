import { Typography } from "@heroui/react";
import { seoCityScreenStyles as styles } from "./SeoCityScreen.styles";
import type { SeoCityScreenProps } from "./SeoCityScreen.types";

export function SeoCityScreen({ cityName, clubs }: SeoCityScreenProps) {
  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>شهر</p>
        <Typography className={styles.title} type="h1" weight="bold">
          باشگاه‌های {cityName}
        </Typography>
        <Typography className={styles.meta} type="body">
          {clubs.length} باشگاه تأییدشده
        </Typography>
      </header>
      <ul className={styles.list}>
        {clubs.map((club) => (
          <li key={club.id} className={styles.item}>
            <a className={styles.link} href={`/clubs/${club.id}`}>
              {club.identity.name}
            </a>
            <p className={styles.address}>
              {club.location?.address ?? "آدرس نامشخص"}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
