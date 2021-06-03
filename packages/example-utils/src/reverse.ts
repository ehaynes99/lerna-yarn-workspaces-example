export const reverse = (str: string) => {
  const result: string[] = [];
  str.split('').forEach((char: string) => result.unshift(char));
  return result.join('') + '*******';
}
