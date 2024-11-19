import { MenuToggle, Select, SelectOption } from "@/libs/patternfly/react-core";
import { useTranslations } from "next-intl";
import { useState } from "react";

export type LimitSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

export function LimitSelector({ value, onChange }: LimitSelectorProps) {
  const t = useTranslations("message-browser");
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen((o) => !o);

  return (
    <Select
      aria-label={t("per_page_aria_label", { value })}
      selected={value}
      isOpen={isOpen}
      onSelect={(_, selectedValue) => {
        setIsOpen(false);
        onChange(selectedValue as number);
      }}
      data-testid={"limit-selector"}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={toggleOpen}
          isExpanded={isOpen}
          className={"pf-v6-u-w-100"}
        >
          {t.rich("per_page_label", { value })}
        </MenuToggle>
      )}
    >
      {[5, 10, 25, 50, 75, 100].map((value, idx) => (
        <SelectOption key={idx} value={value} onClick={() => onChange(value)}>
          {value}
        </SelectOption>
      ))}
    </Select>
  );
}
