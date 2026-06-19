import { Text } from "heroui-native/text";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { MapRegionName } from "@geopoto/geo-data";

import { BackButton } from "@/components/back-button";
import { Header } from "@/components/header/header";
import { ActiveProgramState } from "@/modules/training-program/components/active-program-state";
import { CompletedProgramState } from "@/modules/training-program/components/completed-program-state";
import { NoProgramState } from "@/modules/training-program/components/no-program-state";
import type { TrainingProgramSnapshot } from "@/modules/training-program/utils/training-program";
import { useTrainingProgram } from "@/modules/training-program/utils/training-program-storage";

export function TrainingProgramPage() {
  const { t } = useTranslation();
  const { createProgram, snapshot } = useTrainingProgram();

  const handleStart = useCallback(
    (area: MapRegionName) => {
      createProgram({ area });
    },
    [createProgram],
  );

  return (
    <View className="flex-1 p-safe">
      <TrainingProgramHeader title={t("training-program.title")} />
      <TrainingProgramBody onStart={handleStart} snapshot={snapshot} />
    </View>
  );
}

interface TrainingProgramBodyProps {
  onStart: (area: MapRegionName) => void;
  snapshot: TrainingProgramSnapshot | undefined;
}

/**
 * State-branching container. Because the snapshot lives in MMKV and
 * `useTrainingProgram` is reactive, state transitions (e.g. creating a program,
 * or a future pass completing the program) re-render this body automatically
 * with no manual navigation. Later slices fill the body of each state:
 * - 004-006: the Active body (Daily Test, Practice, stats, cancel).
 * - 007: the Completed screen.
 */
function TrainingProgramBody({ onStart, snapshot }: TrainingProgramBodyProps) {
  if (snapshot === undefined) {
    return <NoProgramState onStart={onStart} />;
  }

  if (snapshot.status === "completed") {
    return <CompletedProgramState snapshot={snapshot} />;
  }

  return <ActiveProgramState snapshot={snapshot} />;
}

interface TrainingProgramHeaderProps {
  title: string;
}

function TrainingProgramHeader({ title }: TrainingProgramHeaderProps) {
  return (
    <Header className="px-2">
      <Header.Left>
        <BackButton />
      </Header.Left>
      <Header.Center style={{ maxWidth: "60%" }}>
        <Text type="h2" align="center" truncate>
          {title}
        </Text>
      </Header.Center>
    </Header>
  );
}
