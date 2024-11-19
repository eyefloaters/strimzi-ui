import { ClusterDetail, ClusterList } from "@/api/kafka/schema";
import {
  Divider,
  Dropdown,
  DropdownItem,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  SearchInput,
} from "@/libs/patternfly/react-core";
import { Link, useRouter } from "@/i18n/routing";
import { Route } from "next";
import { CSSProperties, useState } from "react";

export function KafkaSwitcher<T extends string>({
  selected,
  clusters,
  getSwitchHref,
  isActive = false,
}: {
  selected: ClusterDetail;
  clusters: ClusterList[];
  getSwitchHref: (kafkaId: string) => Route<T> | URL;
  isActive?: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const clusterToDropdownItem = (b: ClusterList) => (
    <DropdownItem
      key={b.id}
      value={b.id}
      id={b.id}
      onClick={() => {
        setIsOpen(false);
      }}
      description={`Namespace: ${b.attributes.namespace}`}
    >
      {b.attributes.name}
    </DropdownItem>
  );

  const menuItems = clusters
    .filter(
      (b) =>
        searchText === "" ||
        b.attributes.name.toLowerCase().includes(searchText.toLowerCase()),
    )
    .map(clusterToDropdownItem);
  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      onOpenChangeKeys={["Escape"]}
      toggle={(toggleRef) => (
        <MenuToggle
          aria-label="Toggle"
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          variant={"plainText"}
          className={"pf-v6-u-p-0"}
          style={
            {
              "--pf-v6-c-menu-toggle__toggle-icon--MarginRight": 0,
              "--pf-v6-c-menu-toggle__controls--PaddingLeft":
                "var(--pf-v6--global--spacer--sm)",
            } as CSSProperties
          }
        >
          {isActive === false ? (
            <Link
              href={`/kafka/${selected.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              {selected.attributes.name}
            </Link>
          ) : (
            selected.attributes.name
          )}
        </MenuToggle>
      )}
      onSelect={(_ev, value) => {
        if (typeof value === "string") {
          router.push(getSwitchHref(value).toString());
        }
      }}
      selected={selected.id}
    >
      <MenuSearch>
        <MenuSearchInput>
          <SearchInput
            aria-label="Filter menu items"
            value={searchText}
            onChange={(_event, value) => setSearchText(value)}
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />

      {menuItems}
    </Dropdown>
  );
}
