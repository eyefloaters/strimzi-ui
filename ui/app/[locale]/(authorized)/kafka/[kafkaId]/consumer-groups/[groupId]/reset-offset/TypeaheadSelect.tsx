import React, { useState } from "react";
import {
  Select,
  SelectOption,
  SelectProps,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
} from "@patternfly/react-core";
import { TimesIcon } from "@patternfly/react-icons";

export function TypeaheadSelect({
  value,
  selectItems,
  onChange,
  placeholder,
}: {
  value: string | number;
  selectItems: (string | number)[];
  onChange: (item: string | number) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterValue, setFilterValue] = useState<string>("");
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const textInputRef = React.useRef<HTMLInputElement>(null);

  const NO_RESULTS = "no results";

  const uniqueItems = Array.from(new Set(selectItems));

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      textInputRef.current?.focus();
    }
  };

  const onSelect: SelectProps["onSelect"] = (_event, selection) => {
    if (selection !== NO_RESULTS) {
      onChange(selection as string | number);
      setFilterValue("");
    }
    setIsOpen(false);
  };

  const filteredItems = filterValue
    ? uniqueItems.filter((item) =>
        item.toString().toLowerCase().includes(filterValue.toLowerCase()),
      )
    : uniqueItems;

  const options = filteredItems.length
    ? filteredItems.map((item) => (
        <SelectOption key={item} value={item}>
          {item}
        </SelectOption>
      ))
    : [
        <SelectOption key={NO_RESULTS} value={NO_RESULTS} isAriaDisabled>
          {`No results found for "${filterValue}"`}
        </SelectOption>,
      ];

  const onInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setFilterValue(value);
    setFocusedItemIndex(null);
    if (value === "") {
      onChange("");
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && focusedItemIndex !== null) {
      const selectedItem = filteredItems[focusedItemIndex];
      onChange(selectedItem);
      setIsOpen(false);
    }
  };

  const onClearButtonClick = () => {
    setFilterValue("");
    setFocusedItemIndex(null);
    setActiveItemId(null);
    onChange("");
    textInputRef.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      aria-label="Typeahead menu toggle"
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={filterValue || value}
          onClick={() => setIsOpen(true)}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          id="typeahead-select-input"
          autoComplete="off"
          ref={textInputRef}
          placeholder={placeholder}
          {...(activeItemId && { "aria-activedescendant": activeItemId })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="typeahead-select-listbox"
        />
        <TextInputGroupUtilities>
          {(filterValue || value) && (
            <Button
              icon={<TimesIcon aria-hidden />}
              variant="plain"
              onClick={onClearButtonClick}
              aria-label="Clear input value"
            />
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id="typeahead-select"
      isOpen={isOpen}
      selected={value ? [value] : []}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(!isOpen)}
      toggle={toggle}
      shouldFocusFirstItemOnOpen={false}
    >
      <SelectList id="typeahead-select-listbox">{options}</SelectList>
    </Select>
  );
}
