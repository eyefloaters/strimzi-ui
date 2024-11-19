import { Nav, Page } from "@/libs/patternfly/react-core";
import { useTranslations } from "next-intl";
import { PropsWithChildren, ReactNode } from "react";
import { AppMasthead } from "./AppMasthead";
import { AppSidebar } from "./AppSidebar";
import { ClusterDrawer } from "./ClusterDrawer";

import { ClusterDrawerProvider } from "./ClusterDrawerProvider";
import { ReconciliationProvider } from "./ReconciliationProvider";
import { ReconciliationPausedBanner } from "./ReconciliationPausedBanner";
import { AlertProvider } from "./AlertProvider";

export function AppLayout({
  username,
  sidebar,
  children,
  kafkaId,
}: PropsWithChildren<{
  username?: string;
  sidebar?: ReactNode;
  kafkaId?: string;
}>) {
  const t = useTranslations();

  const isValidKafkaId = !!kafkaId;
  return (
    <Page
      masthead={
        <AppMasthead username={username} showSidebarToggle={!!sidebar} />
      }
      sidebar={
        sidebar && (
          <AppSidebar>
            <Nav aria-label={t("AppLayout.main_navigation_aria_label")}>
              {sidebar}
            </Nav>
          </AppSidebar>
        )
      }
    >
      {/*<HelpContainer>*/}
      <ClusterDrawerProvider>
        <AlertProvider>
          <ReconciliationProvider kafkaId={kafkaId ?? ""}>
            {isValidKafkaId && <ReconciliationPausedBanner kafkaId={kafkaId} />}
            <ClusterDrawer>{children}</ClusterDrawer>
          </ReconciliationProvider>
        </AlertProvider>
      </ClusterDrawerProvider>
      {/*</HelpContainer>*/}
    </Page>
  );
}
