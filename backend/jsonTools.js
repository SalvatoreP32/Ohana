import { readFile, writeFile } from "node:fs/promises";
const filePath = new URL("Ohana.json", import.meta.url);
 
async function savePeople(people) {
  await writeFile(filePath, JSON.stringify(people, null, 2));
  return people;
}
 
export async function loadFamily() {
  return JSON.parse(await readFile(filePath, "utf8"));
}
 
export async function addPerson(person) {
  const people = await loadFamily();
  let highestId = 0;
  for (const existingPerson of people) {
    highestId = Math.max(highestId, Number(existingPerson.id));
  }
  const newPerson = Object.assign({ id: String(highestId + 1), familyId: "1" }, person);
  people.push(newPerson);
  return savePeople(people);
}
 
export async function editPerson(id, changes) {
  const people = await loadFamily();
  const person = people.find((p) => p.id === id);
  if (!person) {
    throw new Error("No person with id " + id);
  }
  Object.assign(person, changes);
  return savePeople(people);
}
 
export async function removePerson(id) {
  const people = await loadFamily();
  return savePeople(people.filter((p) => p.id !== id));
}
 