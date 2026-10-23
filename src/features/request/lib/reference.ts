const REQUEST_REFERENCE_PATTERN = /^MP-(\d{4})-(\d{4,})$/;

export function generateRequestReference(
  year: number,
  existingReferences: readonly string[],
): string {
  const prefix = `MP-${year}-`;
  const highestSequence = existingReferences.reduce((highest, reference) => {
    if (!reference.startsWith(prefix)) {
      return highest;
    }

    const match = REQUEST_REFERENCE_PATTERN.exec(reference);
    if (match === null || Number(match[1]) !== year) {
      return highest;
    }

    return Math.max(highest, Number(match[2]));
  }, 0);

  return `${prefix}${String(highestSequence + 1).padStart(4, '0')}`;
}
