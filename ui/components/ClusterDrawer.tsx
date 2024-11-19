"use client";
import {
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
  Title,
} from "@/libs/patternfly/react-core";
import { Skeleton } from "@patternfly/react-core";
import { useTranslations } from "next-intl";
import { PropsWithChildren, Suspense } from "react";
import { ClusterConnectionDetails } from "./ClusterConnectionDetails";
import { useClusterDrawerContext } from "./ClusterDrawerContext";

export function ClusterDrawer({ children }: PropsWithChildren) {
  const t = useTranslations();
  const { expanded, clusterId, close } = useClusterDrawerContext();
  return (
    <Drawer isExpanded={expanded}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent isResizable={true}>
            <DrawerHead>
              <Title headingLevel={"h3"}>
                {t("ClusterDrawer.cluster_connection_details")}
              </Title>
              <DrawerActions>
                <DrawerCloseButton onClick={close} />
              </DrawerActions>
            </DrawerHead>
            <Divider />
            <Suspense
              fallback={
                <div className={"pf-v6-u-p-lg"}>
                  <Skeleton width={"80%"} className="pf-v6-u-my-md" />
                  <Skeleton width={"50%"} className="pf-v6-u-my-md" />
                  <Skeleton width={"60%"} className="pf-v6-u-my-md" />
                  <Skeleton width={"30%"} className="pf-v6-u-my-md" />
                  <Skeleton width={"80%"} className="pf-v6-u-my-md" />
                  <Skeleton width={"50%"} className="pf-v6-u-my-md" />
                  <Skeleton width={"60%"} className="pf-v6-u-my-md" />
                  <Skeleton width={"30%"} className="pf-v6-u-my-md" />
                  <Skeleton width={"80%"} className="pf-v6-u-my-md" />
                </div>
              }
            >
              {clusterId && <ClusterConnectionDetails clusterId={clusterId} />}
            </Suspense>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody
          className={"pf-v6-u-display-flex pf-v6-u-flex-direction-column"}
          // style={{
          //   height: "100%",
          //   width: "100%",
          //   overflowY: "auto",
          //   position: "absolute",
          // }}
        >
          {children}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
}
