export async function readJSONFile(filename: string) {
  return JSON.parse(await Deno.readTextFile(filename))
}

export async function writeJSONFile(filename: string, data: unknown) {
  await Deno.writeTextFile(filename, JSON.stringify(data, null, 2))
}
