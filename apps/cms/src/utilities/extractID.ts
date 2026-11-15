export const extractID = <T extends number | string>(
  objectOrID: T | { id: T },
): T => {
  if (objectOrID && typeof objectOrID === 'object') return objectOrID.id

  return objectOrID
}
