import type { ToolbarToggleGroupProps } from "@/libs/patternfly/react-core";
import {
  InputGroup,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from "@/libs/patternfly/react-core";
import { FilterIcon } from "@/libs/patternfly/react-icons";
import { useState } from "react";
import {
  FilterCheckbox,
  FilterSearch,
  FilterSelect,
  FilterSwitcher,
} from "./components";
import type { FilterType } from "./types";

export type ChipFilterProps = {
  filters: { [label: string]: FilterType };
  breakpoint?: ToolbarToggleGroupProps["breakpoint"];
};

export function ChipFilter({ filters, breakpoint = "md" }: ChipFilterProps) {
  const options = Object.keys(filters);
  const [selectedOption, setSelectedOption] = useState<string>(options[0]);

  const getFilterComponent = (label: string, f: FilterType) => {
    switch (f.type) {
      case "search":
        return (
          <FilterSearch
            onSearch={f.onSearch}
            label={label}
            validate={f.validate}
            errorMessage={f.errorMessage}
          />
        );
      case "checkbox":
        return (
          <FilterCheckbox
            chips={f.chips}
            options={f.options}
            onToggle={f.onToggle}
            label={label}
          />
        );
      case "select":
        return (
          <FilterSelect
            chips={f.chips}
            options={f.options}
            onToggle={f.onToggle}
            label={label}
          />
        );
    }
  };

  return (
    <>
      <ToolbarItem
        variant={"label"}
        visibility={{ default: "hidden", [breakpoint]: "visible" }}
        data-testid={"large-viewport-toolbar"}
      >
        <InputGroup>
          {options.length > 1 && (
            <FilterSwitcher
              options={options}
              value={selectedOption}
              onChange={setSelectedOption}
              ouiaId={"chip-filter-selector-large-viewport"}
            />
          )}
          {getFilterComponent(selectedOption, filters[selectedOption])}
        </InputGroup>
      </ToolbarItem>
      <ToolbarToggleGroup
        toggleIcon={<FilterIcon />}
        breakpoint={breakpoint}
        visibility={{ default: "visible", [breakpoint]: "hidden" }}
      >
        <ToolbarGroup variant="filter-group">
          {options.length > 1 && (
            <FilterSwitcher
              options={options}
              value={selectedOption}
              onChange={setSelectedOption}
              ouiaId={"chip-filter-selector-small-viewport"}
            />
          )}
          {Object.entries(filters).map(([label, f], index) => (
            <ToolbarFilter
              key={index}
              labels={
                "options" in f
                  ? f.chips.map((c) => ({ key: c, node: f.options[c] }))
                  : f.chips
              }
              deleteLabel={(_, chip) =>
                f.onRemoveChip(typeof chip === "string" ? chip : chip.key)
              }
              deleteLabelGroup={f.onRemoveGroup}
              categoryName={label}
              showToolbarItem={label === selectedOption}
            >
              {label === selectedOption && getFilterComponent(label, f)}
            </ToolbarFilter>
          ))}
        </ToolbarGroup>
      </ToolbarToggleGroup>
    </>
  );
}
