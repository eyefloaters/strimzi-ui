import { ExternalLink } from "@/components/Navigation/ExternalLink";
import {
  Button,
  Content,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
} from "@/libs/patternfly/react-core";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function ResetOffsetModal({
  members,
  isResetOffsetModalOpen,
  onClickClose,
  kafkaId,
  consumerGroupName,
}: {
  members: string[];
  isResetOffsetModalOpen: boolean;
  onClickClose: () => void;
  kafkaId: string;
  consumerGroupName: string;
}) {
  const t = useTranslations("ConsumerGroupsTable");
  const router = useRouter();

  const refresh = () => {
    if (members.length === 0) {
      router.push(
        `/kafka/${kafkaId}/consumer-groups/${consumerGroupName}/reset-offset`,
      );
    }
  };

  return (
    <Modal
      isOpen={isResetOffsetModalOpen}
      variant={ModalVariant.medium}
      onClose={onClickClose}
    >
      <ModalHeader
        title={t("consumer_group_must_be_empty")}
        titleIconVariant={"warning"}
      />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Content>{t("member_shutdown_helper_text")}</Content>
          </StackItem>
          <StackItem>
            <List>
              {members.map((member, index) => (
                <ListItem key={index}>{member}</ListItem>
              ))}
            </List>
          </StackItem>
          <StackItem>
            <Content>{t("shutdown_active_members")}</Content>
          </StackItem>
          <StackItem>
            <ExternalLink testId={"learn_to_shutdown_members"} href={""}>
              {t("learn_to_shutdown_members")}
            </ExternalLink>
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button key="close" variant="primary" onClick={onClickClose}>
          {t("close")}
        </Button>
        <Button key="refresh" variant="secondary" onClick={refresh}>
          {t("refresh")}
        </Button>
        <Button key="refresh" variant="link" onClick={onClickClose}>
          {t("cancel")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
