import { Text } from "@/libs/patternfly/react-core";
import { getRequestConfig } from "next-intl/server";
import { IntlConfig } from "use-intl";

export const defaultTranslationValues: IntlConfig["defaultTranslationValues"] =
  {
    strong: (text) => <strong>{text}</strong>,
    b: (text) => <b>{text}</b>,
    i: (text) => <i>{text}</i>,
    br: () => <br />,
    p: (text) => <p>{text}</p>,
    text: (text) => <Text>{text}</Text>,
  };

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  defaultTranslationValues,
}));
