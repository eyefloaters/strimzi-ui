import {
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  NumberInput,
  Content,
  Title,
} from "@patternfly/react-core";
import { useTranslations } from "next-intl";

export function FieldPartitions({
  partitions,
  onChange,
  invalid,
  backendError,
}: {
  partitions: number;
  onChange: (partitions: number) => void;
  invalid: boolean;
  backendError: string | false;
}) {
  const t = useTranslations();
  return (
    <FormSection>
      <Content>
        <Title headingLevel={"h3"}>
          {t("CreateTopic.topic_partition_field")}
        </Title>
        <Content component={"small"}>
          {t("CreateTopic.topic_partition_field_description")}
        </Content>
      </Content>
      <FormGroup label="Partitions" isRequired fieldId="topic-partitions">
        <NumberInput
          required
          id="topic-partitions"
          name="topic-partitions"
          aria-describedby="topic-partitions-helper"
          value={partitions}
          onChange={(ev) =>
            onChange(parseInt((ev.target as HTMLInputElement).value, 10))
          }
          onMinus={() => onChange(partitions > 1 ? partitions - 1 : partitions)}
          onPlus={() => onChange(partitions + 1)}
          min={1}
          validated={invalid || backendError ? "error" : "default"}
        />
        <FormHelperText>
          <HelperText id={"topic-partitions-helper"}>
            <HelperTextItem variant={"indeterminate"}>
              {t("CreateTopic.topic_partition_helper_text")}
            </HelperTextItem>
            {backendError && (
              <HelperTextItem variant={"error"} component={"li"}>
                {backendError}
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </FormSection>
  );
}
