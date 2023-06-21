export function getClientEnv(elemTagname) {
  const varName = getVarnameFromCustomElementTagname(elemTagname);
  return varName && (window || {})[varName];
}

export function getVarnameFromCustomElementTagname(elemTagname) {
    // generate client-side env variablename from CustomElementTagname to ensure consistency
    return `__${elemTagname}_env__`;
}
