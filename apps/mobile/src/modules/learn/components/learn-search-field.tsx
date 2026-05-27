import { SearchField } from "heroui-native/search-field";

interface LearnSearchFieldProps {
  accessibilityLabel: string;
  clearAccessibilityLabel: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export function LearnSearchField({
  accessibilityLabel,
  clearAccessibilityLabel,
  onChange,
  placeholder,
  value,
}: LearnSearchFieldProps) {
  return (
    <SearchField value={value} onChange={onChange}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input
          accessibilityLabel={accessibilityLabel}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={placeholder}
          spellCheck={false}
        />
        <SearchField.ClearButton accessibilityLabel={clearAccessibilityLabel} />
      </SearchField.Group>
    </SearchField>
  );
}
