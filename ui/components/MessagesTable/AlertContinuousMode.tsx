import { Alert } from "@/libs/patternfly/react-core";
import { AlertActionLink } from "@patternfly/react-core";
import { PauseIcon, PlayIcon } from "@patternfly/react-icons";
import { useTranslations } from "next-intl";

export function AlertContinuousMode({
  isPaused,
  onToggle,
}: {
  isPaused: boolean;
  onToggle: (isPaused: boolean) => void;
}) {
  const t = useTranslations();
  return (
    <Alert
      title={t("AlertContinuousMode.title")}
      variant={"info"}
      isInline={true}
      className={"pf-v6-u-mx-md"}
      actionLinks={
        <AlertActionLink onClick={() => onToggle(!isPaused)}>
          {isPaused ? (
            <>
              <PlayIcon /> {t("AlertContinuousMode.continue")}
            </>
          ) : (
            <>
              <PauseIcon /> {t("AlertContinuousMode.pause")}
            </>
          )}
        </AlertActionLink>
      }
    />
  );
}
