export const LESSON_LINKED_RECORD_TYPES = ["contract", "proposal", "opportunity"] as const;

export type LessonLinkedRecordType = (typeof LESSON_LINKED_RECORD_TYPES)[number];

type LessonLinkState = {
  linkedRecordType: LessonLinkedRecordType | null;
  linkedRecordId: number | null;
};

type LessonLinkPatch = {
  linkedRecordType?: LessonLinkedRecordType | null;
  linkedRecordId?: number | null;
};

export function resolveLessonLinkState(
  current: LessonLinkState,
  patch: LessonLinkPatch,
): LessonLinkState {
  const linkedRecordType =
    patch.linkedRecordType !== undefined
      ? patch.linkedRecordType
      : current.linkedRecordType;
  const linkedRecordId =
    patch.linkedRecordId !== undefined
      ? patch.linkedRecordId
      : current.linkedRecordId;

  if ((linkedRecordType === null) !== (linkedRecordId === null)) {
    throw new Error(
      "Linked record type and linked record ID must be provided or cleared together.",
    );
  }

  return { linkedRecordType, linkedRecordId };
}
