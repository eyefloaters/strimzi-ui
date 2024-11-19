import { Dropdown, DropdownItem, MenuToggle } from "@patternfly/react-core";
import { useEffect, useState } from "react";
import { MessagesTableProps } from "../MessagesTable";

export function WhereSelector({
  value,
  onChange,
}: {
  value: MessagesTableProps["filterWhere"];
  onChange: (value: MessagesTableProps["filterWhere"]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(false);
  }, [value]);
  return (
    <Dropdown
      data-testid={"filter-group-dropdown"}
      toggle={(toggleRef) => (
        <MenuToggle
          onClick={() => {
            setIsOpen(true);
          }}
          isDisabled={false}
          isExpanded={isOpen}
          data-testid={"filter-group"}
          ref={toggleRef}
          className={"pf-v6-u-w-100"}
        >
          {(() => {
            switch (value) {
              case "value":
                return "Value";
              case "key":
                return "Key";
              case "headers":
                return "Headers";
              default:
                return "Anywhere";
            }
          })()}
        </MenuToggle>
      )}
      isOpen={isOpen}
      onOpenChange={() => {
        setIsOpen((v) => !v);
      }}
    >
      <DropdownItem
        isSelected={value === undefined}
        onClick={() => onChange(undefined)}
      >
        Anywhere
      </DropdownItem>
      <DropdownItem key="key" value="key" onClick={() => onChange("key")}>
        Key
      </DropdownItem>
      <DropdownItem
        isSelected={value === "headers"}
        onClick={() => onChange("headers")}
      >
        Header
      </DropdownItem>
      <DropdownItem
        isSelected={value === "value"}
        onClick={() => onChange("value")}
      >
        Value
      </DropdownItem>
    </Dropdown>
  );
}
