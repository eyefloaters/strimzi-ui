"use client";

import {
  Banner,
  Bullseye,
  Button,
  Flex,
  FlexItem,
} from "@/libs/patternfly/react-core";
import { useTranslations } from "next-intl";
import { useReconciliationContext } from "./ReconciliationContext";
import { updateKafkaCluster } from "@/api/kafka/actions";

export function ReconciliationPausedBanner({ kafkaId }: { kafkaId: string }) {
  const t = useTranslations();

  const { isReconciliationPaused, setReconciliationPaused } =
    useReconciliationContext();

  const resumeReconciliation = async () => {
    try {
      const success = await updateKafkaCluster(kafkaId, false);

      if (success) {
        setReconciliationPaused(false);
      }
    } catch (e: unknown) {
      console.log("Unknown error occurred");
    }
  };

  if (!isReconciliationPaused) return null;

  return (
    <Banner status="warning">
      <Bullseye>
        <Flex>
          <FlexItem spacer={{ default: "spacerNone" }}>
            {t("reconciliation.reconciliation_paused_warning")}
          </FlexItem>
          &nbsp;
          <FlexItem spacer={{ default: "spacerLg" }}>
            <Button variant="link" isInline onClick={resumeReconciliation}>
              {t("reconciliation.resume")}
            </Button>
          </FlexItem>
        </Flex>
      </Bullseye>
    </Banner>
  );
}
