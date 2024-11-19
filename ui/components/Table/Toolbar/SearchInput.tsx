import {
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  Tooltip,
  ValidatedOptions,
} from "@/libs/patternfly/react-core";
import { ArrowRightIcon } from "@/libs/patternfly/react-icons";
import { useCallback, useRef, useState } from "react";

export type SearchInputProps = {
  placeholder: string;
  errorMessage: string;
  validate: (value: string) => boolean;
  onSearch: (value: string) => void;
};

export function SearchInput({
  placeholder,
  errorMessage,
  validate,
  onSearch,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isEmpty = value.length === 0;
  const isValid = !isEmpty && validate(value);
  const showErrorFeedback = !isEmpty && !isValid;
  const canSearch = !isEmpty && isValid;

  const handleSearch = useCallback(() => {
    if (canSearch) {
      onSearch(value);
      setValue("");
    }
  }, [canSearch, onSearch, value]);

  return (
    <InputGroup>
      <TextInput
        name="search"
        id="search"
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        validated={
          showErrorFeedback ? ValidatedOptions.error : ValidatedOptions.default
        }
        value={value}
        onChange={(_, value) => setValue(value)}
        ref={inputRef}
      />
      <Button
        isDisabled={!canSearch}
        variant={ButtonVariant.control}
        onClick={handleSearch}
        aria-label={"Search"}
      >
        <ArrowRightIcon />
      </Button>
      <Tooltip
        trigger="manual"
        isVisible={showErrorFeedback}
        content={errorMessage}
        triggerRef={inputRef}
      />
    </InputGroup>
  );
}
