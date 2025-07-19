export function parseGermanNumber(germanNumberString: string): any {
  if (germanNumberString) {
    let cleanedString = germanNumberString.replace(/\./g, '');
    cleanedString = cleanedString.replace(/,/g, '.');
    return parseFloat(cleanedString);
  } else {
    return '';
  }
}
