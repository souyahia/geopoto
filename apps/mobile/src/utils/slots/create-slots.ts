import {
  Children,
  type ComponentType,
  isValidElement,
  type ReactNode,
} from "react";

import { isLocalDev } from "../env";

type SlotComponent<TProps> = ComponentType<TProps>;

export type CreateSlotsResult<TSlot extends string> = {
  main: ReactNode[];
} & Partial<Record<TSlot, ReactNode>>;

function getComponentDisplayName(component: unknown) {
  if (component === null) {
    return undefined;
  }

  if (typeof component !== "function" && typeof component !== "object") {
    return undefined;
  }

  if (!("displayName" in component)) {
    return undefined;
  }

  const { displayName } = component;

  if (typeof displayName !== "string") {
    return undefined;
  }

  return displayName;
}

interface IsSlotTypeMatchParams<TProps> {
  childType: unknown;
  slotComponent: SlotComponent<TProps>;
}

function isSlotTypeMatch<TProps>({
  childType,
  slotComponent,
}: IsSlotTypeMatchParams<TProps>) {
  if (childType === slotComponent) {
    return true;
  }

  if (!isLocalDev) {
    return false;
  }

  const childDisplayName = getComponentDisplayName(childType);
  const slotDisplayName = getComponentDisplayName(slotComponent);

  if (childDisplayName === undefined) {
    return false;
  }

  return childDisplayName === slotDisplayName;
}

interface GetSlotNameParams<TSlot extends string, TProps> {
  childType: unknown;
  slotsDefinition: Record<TSlot, SlotComponent<TProps>>;
}

function getSlotName<TSlot extends string, TProps>({
  childType,
  slotsDefinition,
}: GetSlotNameParams<TSlot, TProps>): TSlot | undefined {
  for (const slotName in slotsDefinition) {
    const slotComponent = slotsDefinition[slotName];

    if (isSlotTypeMatch({ childType, slotComponent })) {
      return slotName;
    }
  }

  return undefined;
}

export function createSlots<TSlot extends string, TProps>(
  children: ReactNode,
  slotsDefinition: Record<TSlot, SlotComponent<TProps>>,
): CreateSlotsResult<TSlot> {
  const main: ReactNode[] = [];
  const slots: Partial<Record<TSlot, ReactNode>> = {};

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      main.push(child);
      return;
    }

    const slotName = getSlotName({
      childType: child.type,
      slotsDefinition,
    });

    if (slotName === undefined) {
      main.push(child);
      return;
    }

    slots[slotName] = child;
  });

  return {
    main,
    ...slots,
  };
}
