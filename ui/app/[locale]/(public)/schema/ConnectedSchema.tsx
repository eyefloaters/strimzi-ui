"use client";

import { SchemaValue } from "@/components/MessagesTable/components/SchemaValue";
import { Flex, FlexItem, PageSection, Title } from "@patternfly/react-core";

export function ConnectedSchema({
  content,
  name,
}: {
  content: string;
  name: string;
}) {
  return (
    <PageSection variant="light">
      <Flex direction={{ default: "column" }} gap={{ default: "gap2xl" }}>
        <FlexItem>
          <Title headingLevel={"h4"}>{name}</Title>
        </FlexItem>
        <FlexItem>
          <SchemaValue schema={content} name={name} />
        </FlexItem>
      </Flex>
    </PageSection>
  );
}
