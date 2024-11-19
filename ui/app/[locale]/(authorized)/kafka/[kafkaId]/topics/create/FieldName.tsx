import {
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  Content,
  TextInput,
  Title,
} from "@patternfly/react-core";
import { useTranslations } from "next-intl";

export function FieldName({
  name,
  onChange,
  nameInvalid,
  lengthInvalid,
  formatInvalid,
  backendError,
}: {
  name: string;
  onChange: (name: string) => void;
  nameInvalid: boolean;
  lengthInvalid: boolean;
  formatInvalid: boolean;
  backendError: string | false;
}) {
  const t = useTranslations();
  const showErrors = name !== "";
  return (
    <FormSection>
      <Content>
        <Title headingLevel={"h3"}>{t("CreateTopic.topic_name_field")}</Title>
        <Content component={"small"}>
          {t("CreateTopic.topic_name_field_description")}
        </Content>
      </Content>
      <FormGroup label="Topic name" isRequired fieldId="topic-name">
        <TextInput
          isRequired
          type="text"
          id="topic-name"
          name="topic-name"
          aria-describedby="topic-name-helper"
          value={name}
          onChange={(_, value) => onChange(value)}
          validated={
            showErrors &&
            (nameInvalid || lengthInvalid || formatInvalid || backendError)
              ? "error"
              : "default"
          }
        />
        <FormHelperText>
          <HelperText component="ul" aria-live="polite" id="topic-name-helper">
            <HelperTextItem
              variant={showErrors && lengthInvalid ? "error" : "indeterminate"}
              component="li"
            >
              {t("CreateTopic.length_invalid_helper_text")}
            </HelperTextItem>
            <HelperTextItem
              variant={showErrors && nameInvalid ? "error" : "indeterminate"}
              component="li"
            >
              {t("CreateTopic.name_invalid_helper_text")}
            </HelperTextItem>
            <HelperTextItem
              variant={showErrors && formatInvalid ? "error" : "indeterminate"}
              component={"li"}
            >
              {t("CreateTopic.format_invalid_helper_text")}
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
