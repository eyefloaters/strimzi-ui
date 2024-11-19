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

export function FieldReplicas({
  replicas,
  maxReplicas,
  onChange,
  showErrors,
  backendError,
}: {
  replicas: number;
  maxReplicas: number;
  onChange: (replicas: number) => void;
  showErrors: boolean;
  backendError: string | false;
}) {
  const t = useTranslations();
  return (
    <FormSection>
      <Content>
        <Title headingLevel={"h3"}>
          {t("CreateTopic.topic_replica_field")}
        </Title>
        <Content component={"small"}>
          {t("CreateTopic.topic_replica_field_description")}
        </Content>
      </Content>
      <FormGroup label="Replicas" isRequired fieldId="topic-replicas">
        <NumberInput
          required
          id="topic-replicas"
          name="topic-replicas"
          aria-describedby="topic-replicas-helper"
          value={replicas}
          onChange={(ev) =>
            onChange(parseInt((ev.target as HTMLInputElement).value, 10))
          }
          onMinus={() => onChange(replicas > 1 ? replicas - 1 : replicas)}
          onPlus={() => onChange(replicas + 1)}
          min={1}
          max={maxReplicas}
          validated={
            replicas > 0 && replicas <= maxReplicas ? "default" : "error"
          }
        />
        <FormHelperText>
          <HelperText id={"topic-replicas-helper"}>
            <HelperTextItem variant={"indeterminate"}>
              {t("CreateTopic.topic_replica_helper_text")}
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
