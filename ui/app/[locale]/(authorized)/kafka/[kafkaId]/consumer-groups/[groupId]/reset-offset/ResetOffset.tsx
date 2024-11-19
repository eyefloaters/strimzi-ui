import {
  Divider,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Radio,
  Form,
  FormGroup,
  FormSection,
  TextInput,
  ActionGroup,
  Button,
  Alert,
  Content,
} from "@/libs/patternfly/react-core";
import { useTranslations } from "next-intl";
import {
  DateTimeFormatSelection,
  OffsetValue,
  TopicSelection,
  partitionSelection,
} from "../types";
import { TypeaheadSelect } from "./TypeaheadSelect";
import { OffsetSelect } from "./OffsetSelect";
import { DryrunSelect } from "./DryrunSelect";

export type Offset = {
  topicId: string;
  topicName: string;
  partition: number;
  offset: string | number;
  metadeta?: string;
};

export function ResetOffset({
  cliCommand,
  consumerGroupName,
  topics,
  partitions,
  selectTopic,
  selectPartition,
  error,
  onTopicSelect,
  selectOffset,
  onPartitionSelect,
  offset,
  isLoading,
  selectDateTimeFormat,
  openDryrun,
  closeResetOffset,
  handleDateTimeChange,
  handleOffsetChange,
  handlePartitionChange,
  handleTopichange,
  handleSave,
  onDateTimeSelect,
  onOffsetSelect,
}: {
  cliCommand: string;
  consumerGroupName: string;
  topics: { topicId: string; topicName: string }[];
  partitions: number[];
  selectTopic: TopicSelection;
  selectPartition: partitionSelection;
  selectOffset: OffsetValue;
  error: string | undefined;
  onTopicSelect: (value: TopicSelection) => void;
  onPartitionSelect: (value: partitionSelection) => void;
  offset: Offset;
  isLoading: boolean;
  selectDateTimeFormat: DateTimeFormatSelection;
  handleTopichange: (topicName: string | number) => void;
  handlePartitionChange: (partition: number | string) => void;
  handleOffsetChange: (value: string) => void;
  closeResetOffset: () => void;
  openDryrun: () => void;
  handleDateTimeChange: (value: string) => void;
  handleSave: () => void;
  onDateTimeSelect: (value: DateTimeFormatSelection) => void;
  onOffsetSelect: (value: OffsetValue) => void;
}) {
  const t = useTranslations("ConsumerGroupsTable");
  return (
    <Panel>
      <PanelHeader>
        <Content>
          <Content component={"h1"}>{t("reset_consumer_offset")}</Content>
        </Content>
        <Content>
          <Content>{t.rich("consumer_name", { consumerGroupName })}</Content>
        </Content>
      </PanelHeader>
      <Divider />
      <PanelMain>
        <PanelMainBody>
          {error && <Alert variant="danger" isInline title={error} />}
          <Form>
            <FormSection title={t("target")}>
              <FormGroup
                role="radiogroup"
                isInline
                fieldId="select-consumer"
                hasNoPaddingTop
                label={t("apply_action_on")}
              >
                <Radio
                  name={"consumer-topic-select"}
                  id={"all-consumer-topic"}
                  label={t("all_consumer_topics")}
                  isChecked={selectTopic === "allTopics"}
                  onChange={() => onTopicSelect("allTopics")}
                />
                <Radio
                  name={"consumer-topic-select"}
                  id={"selected-topic"}
                  label={t("selected_topic")}
                  isChecked={selectTopic === "selectedTopic"}
                  onChange={() => onTopicSelect("selectedTopic")}
                />
              </FormGroup>
              {selectTopic === "selectedTopic" && (
                <TypeaheadSelect
                  value={offset.topicName || ""}
                  selectItems={topics?.map((topic) => topic.topicName)}
                  onChange={handleTopichange}
                  placeholder={"Select topic"}
                />
              )}
              {selectTopic === "selectedTopic" && (
                <FormGroup label={t("partitions")} isInline>
                  <Radio
                    name={"partition-select"}
                    id={"all-partitions"}
                    label={t("all_partitions")}
                    isChecked={selectPartition === "allPartitions"}
                    onChange={() => onPartitionSelect("allPartitions")}
                  />
                  <Radio
                    name={"partition-select"}
                    id={"selected_partition"}
                    label={t("selected_partition")}
                    isChecked={selectPartition === "selectedPartition"}
                    onChange={() => onPartitionSelect("selectedPartition")}
                  />
                </FormGroup>
              )}
              {selectTopic === "selectedTopic" &&
                selectPartition === "selectedPartition" && (
                  <TypeaheadSelect
                    value={offset.partition}
                    selectItems={partitions}
                    onChange={handlePartitionChange}
                    placeholder={"Select partition"}
                  />
                )}
            </FormSection>
            <FormSection title={t("offset_details")}>
              <FormGroup label={t("new_offset")}>
                <OffsetSelect value={selectOffset} onChange={onOffsetSelect} />
              </FormGroup>
              {selectOffset === "custom" && (
                <FormGroup
                  label={t("custom_offset")}
                  fieldId="custom-offset-input"
                >
                  <TextInput
                    id="custom-offset-input"
                    name={t("custom_offset")}
                    value={offset.offset}
                    onChange={(_event, value) => handleOffsetChange(value)}
                    type="number"
                  />
                </FormGroup>
              )}
              {selectOffset === "specificDateTime" && (
                <>
                  <FormGroup
                    role="radiogroup"
                    isInline
                    fieldId="select-consumer"
                    hasNoPaddingTop
                    label={t("select_date_time")}
                  >
                    <Radio
                      name={"select_time"}
                      id={"iso_date_format"}
                      label={t("iso_date_format")}
                      isChecked={selectDateTimeFormat === "ISO"}
                      onChange={() => onDateTimeSelect("ISO")}
                    />
                    <Radio
                      name={"select_time"}
                      id={"unix_date_format"}
                      label={t("unix_date_format")}
                      isChecked={selectDateTimeFormat === "Epoch"}
                      onChange={() => onDateTimeSelect("Epoch")}
                    />
                  </FormGroup>
                  <FormGroup>
                    <TextInput
                      id="date-input"
                      name={"date-input"}
                      type={selectDateTimeFormat === "ISO" ? "text" : "number"}
                      placeholder={
                        selectDateTimeFormat === "ISO"
                          ? "yyyy-MM-dd'T'HH:mm:ss.SSS"
                          : "specify epoch timestamp"
                      }
                      onChange={(_event, value) => handleDateTimeChange(value)}
                    />
                  </FormGroup>
                </>
              )}
            </FormSection>
            <ActionGroup>
              <Button
                variant="primary"
                onClick={handleSave}
                isDisabled={isLoading}
              >
                {t("save")}
              </Button>
              <DryrunSelect openDryrun={openDryrun} cliCommand={cliCommand} />
              <Button
                variant="link"
                onClick={closeResetOffset}
                isDisabled={isLoading}
              >
                {t("cancel")}
              </Button>
            </ActionGroup>
          </Form>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
}
