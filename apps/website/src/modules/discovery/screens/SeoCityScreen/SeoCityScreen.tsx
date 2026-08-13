import { seoCityScreenStyles as styles } from "./SeoCityScreen.styles";
import type { SeoCityScreenProps } from "./SeoCityScreen.types";

export function SeoCityScreen({ cityName, clubs }: SeoCityScreenProps) {
  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>شهر</p>
        <h1 className={styles.title}>باشگاه‌های {cityName}</h1>
        <p className={styles.meta}>{clubs.length} باشگاه تأییدشده</p>
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
