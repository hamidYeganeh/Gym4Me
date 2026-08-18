import { Drawer } from "@heroui/react/drawer";
import { adminFormDrawerVariants } from "./AdminFormDrawer.styles";
import type { AdminFormDrawerProps } from "./AdminFormDrawer.types";

export function AdminFormDrawer({
  isOpen,
  onOpenChange,
  title,
  children,
  className,
}: AdminFormDrawerProps) {
  const styles = adminFormDrawerVariants();

  return (
    <Drawer>
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Content placement="left">
          <Drawer.Dialog className={styles.dialog({ className })}>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>{title}</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className={styles.body()}>{children}</Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
