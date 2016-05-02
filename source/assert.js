export default function assert(assertion, message) {
  if (!assertion) {
    throw new Error(`LOCUS ERROR: ${message}`);
  }
}
