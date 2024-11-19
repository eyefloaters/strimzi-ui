import { MenuToggle, Select, SelectOption } from "@/libs/patternfly/react-core";
import { SelectList } from "@patternfly/react-core";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

const MAX_OPTIONS = 20;

export type PartitionSelectorProps = {
  value: number | undefined;
  partitions: number | undefined;
  onChange: (value: number | undefined) => void;
};

export function PartitionSelector({
  value = -1,
  partitions,
  onChange,
}: PartitionSelectorProps) {
  const t = useTranslations("message-browser");
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen((o) => !o);
  const titleId = "in-partition";

  const handleChange = useCallback(
    (value: string) => {
      if (value !== "") {
        const valueAsNum = parseInt(value, 10);
        if (Number.isInteger(valueAsNum)) {
          onChange(valueAsNum);
        }
      }
      setIsOpen(false);
    },
    [onChange],
  );

  const allPartitions = useMemo(() => {
    return new Array(partitions).fill(0).map((_, index) => index);
  }, [partitions]);

  const makeOptions = useCallback(
    (values: number[]) => {
      const options = values.slice(0, MAX_OPTIONS).map((v) => (
        <SelectOption
          key={v}
          value={v}
          onClick={() => onChange(v)}
          isSelected={value === v}
        >
          {v}
        </SelectOption>
      ));
      const hiddenOptionsCount = values.length - options.length;
      const partialOptions = hiddenOptionsCount
        ? [
            ...options,
            <SelectOption
              key={"more-info"}
              isDisabled={true}
              description={t("partitions_hidden", {
                count: hiddenOptionsCount,
              })}
            />,
          ]
        : options;
      return [
        <SelectOption
          key={"all"}
          isSelected={value === -1}
          value={-1}
          onClick={() => onChange(undefined)}
        >
          {t("partition_placeholder")}
        </SelectOption>,
        ...partialOptions,
      ];
    },
    [onChange, t, value],
  );

  const options = useMemo(() => {
    return makeOptions(allPartitions);
  }, [allPartitions, makeOptions]);

  return (
    <Select
      onSelect={(_, value) => handleChange(value as string)}
      onOpenChange={setIsOpen}
      isOpen={isOpen}
      id={titleId}
      data-testid={"partition-selector"}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={toggleOpen}
          isExpanded={isOpen}
          className={"pf-v6-u-w-100"}
        >
          {value !== -1
            ? t("partition_option", { value })
            : t("partition_placeholder")}
        </MenuToggle>
      )}
    >
      <SelectList>{options}</SelectList>
    </Select>
  );
}
