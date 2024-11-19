"use client";
import { Topic, TopicMutateError } from "@/api/topics/schema";
import { Error } from "@/app/[locale]/(authorized)/kafka/[kafkaId]/topics/create/Errors";
import { topicMutateErrorToFieldError } from "@/app/[locale]/(authorized)/kafka/[kafkaId]/topics/create/topicMutateErrorToFieldError";
import { Number } from "@/components/Format/Number";
import { ResponsiveTableProps, TableView } from "@/components/Table";
import { usePathname, useRouter } from "@/i18n/routing";
import { isReadonly } from "@/utils/env";
import {
  Button,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  LabelGroup,
  List,
  ListItem,
  PageSection,
  TextInput,
} from "@patternfly/react-core";
import { CheckIcon, PencilAltIcon, TimesIcon } from "@patternfly/react-icons";
import { TableVariant } from "@patternfly/react-table";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { NoResultsEmptyState } from "./NoResultsEmptyState";

type Column = "property" | "value";
const columns: readonly Column[] = ["property", "value"] as const;

export function ConfigTable({
  topic,
  onSaveProperty,
}: {
  topic: Topic | undefined;
  onSaveProperty:
    | ((name: string, value: string) => Promise<boolean | TopicMutateError>)
    | undefined;
}) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (params: { name: string; value: string }[]) => {
      const sp = new URLSearchParams(searchParams);
      params.forEach(({ name, value }) => sp.set(name, value));

      return sp.toString();
    },
    [searchParams],
  );

  const allData = Object.entries(topic?.attributes.configs || {});

  // derive the available data sources from the config values
  const dataSources = Array.from(
    new Set(allData.map(([_, property]) => property.source)),
  );

  // read filters from the search params
  const propertyFilter = searchParams.get("filter");
  const rawSelectedDataSources = searchParams.get("data-source");
  const selectedDataSources =
    rawSelectedDataSources == ""
      ? []
      : rawSelectedDataSources?.split(",") || dataSources;

  // prepare the filtered data
  const filteredData = allData
    .filter((e) => (propertyFilter ? e[0].includes(propertyFilter) : true))
    .filter((e) =>
      selectedDataSources ? selectedDataSources.includes(e[1].source) : true,
    )
    .sort((a, b) => a[0].localeCompare(b[0]));

  function onReset() {
    router.push(
      pathname +
        "?" +
        createQueryString([
          { name: "filter", value: "" },
          {
            name: "data-source",
            value: dataSources.join(","),
          },
        ]),
    );
  }

  function onRemoveDataSource(value: string) {
    const chips = selectedDataSources.includes(value)
      ? selectedDataSources.filter((v) => v !== value)
      : [...selectedDataSources, value];
    router.push(
      pathname +
        "?" +
        createQueryString([
          { name: "filter", value: propertyFilter || "" },
          {
            name: "data-source",
            value: chips.length > 0 ? chips.join(",") : "",
          },
        ]),
    );
  }

  const [isEditing, setIsEditing] = useState<
    Record<string, "editing" | "saving" | undefined>
  >({});
  const [options, setOptions] = useState<Record<string, string>>({});
  const [error, setError] = useState<TopicMutateError | "unknown" | undefined>(
    undefined,
  );
  const fieldError = topicMutateErrorToFieldError(
    error,
    true,
    Object.keys(topic?.attributes.configs || {}),
  );

  const renderCell = useCallback<
    ResponsiveTableProps<(typeof allData)[number], Column>["renderCell"]
  >(
    ({ column, key, row: [name, property], Td }) => {
      function format(p: typeof property) {
        switch (p.type) {
          case "INT":
          case "LONG":
            return (
              <Number value={p.value ? parseInt(p.value, 10) : undefined} />
            );
          case "STRING":
            if (p.source !== "STATIC_BROKER_CONFIG") {
              return p.value || "-";
            }
          // pass through as this is a list in disguise
          case "LIST":
            return (
              <List isPlain={true} isBordered={true}>
                {p.value
                  ?.split(",")
                  .map((v, idx) => <ListItem key={idx}>{v || "-"}</ListItem>)}
              </List>
            );
          default:
            if (p.sensitive) {
              return "******";
            }
            return p.value || "-";
        }
      }

      switch (column) {
        case "property":
          return (
            <Td key={key} dataLabel={t("ConfigTable.property")}>
              <div>{name}</div>
              <LabelGroup>
                <Label isCompact={true} color="teal">
                  source={property.source}
                </Label>
                {property.readOnly && (
                  <Label isCompact={true} color={"grey"}>
                    {t("ConfigTable.read_only")}
                  </Label>
                )}
              </LabelGroup>
            </Td>
          );
        case "value":
          if (isEditing[name] !== undefined) {
            const validated = fieldError?.field === name ? "error" : "default";
            return (
              <Td key={name} dataLabel={t("ConfigTable.value")}>
                <FormGroup fieldId={name}>
                  <TextInput
                    id={`property-${name}`}
                    placeholder={property.value}
                    value={options[name] || ""}
                    onChange={(_, value) => {
                      if (value.trim() !== "") {
                        setOptions({
                          ...options,
                          [name]: value,
                        });
                      } else {
                        const newOpts = { ...options };
                        delete newOpts[name];
                        setOptions(newOpts);
                      }
                    }}
                    validated={validated}
                    isDisabled={isEditing[name] === "saving"}
                  />
                  {validated === "error" && (
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem variant={validated}>
                          {fieldError?.error}
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  )}
                </FormGroup>
              </Td>
            );
          } else {
            return (
              <Td key={name} dataLabel={"Value"}>
                {format(property)}
              </Td>
            );
          }
      }
    },
    [fieldError?.error, fieldError?.field, isEditing, options, t],
  );

  return (
    <>
      {error && !fieldError && (
        <PageSection
          hasBodyWrapper={false}
          padding={{ default: "noPadding" }}
          className={"pf-v5-u-pb-md"}
        >
          <Error error={error} />
        </PageSection>
      )}
      <TableView
        ariaLabel={"Node configuration"}
        toolbarBreakpoint={"md"}
        columns={columns}
        data={filteredData}
        isFiltered={filteredData.length !== allData.length}
        onClearAllFilters={onReset}
        filters={{
          Property: {
            type: "search",
            onSearch: (value) => {
              router.push(
                pathname +
                  "?" +
                  createQueryString([
                    { name: "filter", value },
                    {
                      name: "data-source",
                      value: selectedDataSources.join(","),
                    },
                  ]),
              );
            },
            errorMessage: "",
            validate: () => true,
            onRemoveGroup: () => {
              router.push(
                pathname +
                  "?" +
                  createQueryString([
                    { name: "filter", value: "" },
                    {
                      name: "data-source",
                      value: selectedDataSources.join(","),
                    },
                  ]),
              );
            },
            chips: propertyFilter ? [propertyFilter] : [],
            onRemoveChip: () => {
              router.push(
                pathname +
                  "?" +
                  createQueryString([
                    { name: "filter", value: "" },
                    {
                      name: "data-source",
                      value: selectedDataSources.join(","),
                    },
                  ]),
              );
            },
          },
          "Data source": {
            type: "checkbox",
            options: Object.fromEntries(dataSources.map((s) => [s, s])),
            onRemoveChip: onRemoveDataSource,
            chips: selectedDataSources,
            onRemoveGroup: () => {
              router.push(
                pathname +
                  "?" +
                  createQueryString([
                    { name: "filter", value: propertyFilter || "" },
                    {
                      name: "data-source",
                      value: "",
                    },
                  ]),
              );
            },
            onToggle: onRemoveDataSource,
          },
        }}
        emptyStateNoData={<div></div>}
        emptyStateNoResults={<NoResultsEmptyState onReset={onReset} />}
        onPageChange={() => {}}
        renderHeader={({ column, key, Th }) => {
          switch (column) {
            case "property":
              return (
                <Th key={key} width={40}>
                  {t("ConfigTable.property")}
                </Th>
              );
            case "value":
              return <Th key={key}>{t("ConfigTable.value")}</Th>;
          }
        }}
        renderCell={renderCell}
        renderActions={({ row: [name] }) => {
          if (isReadonly) {
            return <></>;
          }

          return isEditing[name] ? (
            <div
              className="pf-v5-c-inline-edit pf-m-inline-editable"
              id="inline-edit-action-group-icon-buttons-example"
            >
              <div className="pf-v5-c-inline-edit__group pf-m-action-group pf-m-icon-group">
                <div className="pf-v5-c-inline-edit__action pf-m-valid">
                  <Button
                    icon={<CheckIcon />}
                    variant={"plain"}
                    isLoading={isEditing[name] === "saving"}
                    isDisabled={isEditing[name] === "saving"}
                    onClick={async () => {
                      setIsEditing((isEditing) => ({
                        ...isEditing,
                        [name]: "saving",
                      }));
                      const res = await onSaveProperty!(name, options[name]);
                      if (res === true) {
                        setIsEditing((isEditing) => ({
                          ...isEditing,
                          [name]: undefined,
                        }));
                      } else {
                        if (res !== false) {
                          setError(res);
                        } else {
                          setError("unknown");
                        }
                        setIsEditing((isEditing) => ({
                          ...isEditing,
                          [name]: "editing",
                        }));
                      }
                    }}
                  />
                </div>
                <div className="pf-v5-c-inline-edit__action">
                  <Button
                    icon={<TimesIcon />}
                    variant={"plain"}
                    isDisabled={isEditing[name] === "saving"}
                    onClick={() => {
                      setIsEditing((isEditing) => ({
                        ...isEditing,
                        [name]: undefined,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Button
              icon={<PencilAltIcon />}
              variant={"plain"}
              onClick={() =>
                setIsEditing((isEditing) => ({
                  ...isEditing,
                  [name]: "editing",
                }))
              }
            />
          );
        }}
        variant={TableVariant.compact}
      />
    </>
  );
}
