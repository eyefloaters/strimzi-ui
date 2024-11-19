"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from "@/libs/patternfly/react-core";
import { useTranslations } from "next-intl";

export function ReconciliationModal({
  isModalOpen,
  onClickClose,
  onClickPauseReconciliation,
}: {
  isModalOpen: boolean;
  onClickClose: () => void;
  onClickPauseReconciliation: () => void;
}) {
  const t = useTranslations();
  return (
    <Modal
      title={t("reconciliation.pause_reconciliation")}
      isOpen={isModalOpen}
      variant={ModalVariant.medium}
      onClose={onClickClose}
    >
      <ModalHeader
        title={t("reconciliation.pause_reconciliation")}
      ></ModalHeader>
      <ModalBody>
        {t("reconciliation.pause_reconciliation_description")}
        {t("reconciliation.pause_reconciliation_description")}
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant="primary"
          onClick={onClickPauseReconciliation}
        >
          {t("reconciliation.confirm")}
        </Button>
        <Button key="cancel" variant="link" onClick={onClickClose}>
          {t("reconciliation.cancel")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
