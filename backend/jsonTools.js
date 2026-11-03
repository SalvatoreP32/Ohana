import { readFileSync, writeFileSync } from "node:fs";
const filePath = "Ohana.json";

function savePeople(people) {
  writeFileSync(filePath, JSON.stringify(people, null, 2));
  return people;
}

export function loadFamily() {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function addPerson(newPerson) {
  const people = loadFamily();
  let highestId = 0;
  for (const person of people) {
    if (Number(person.id) > highestId) {
      highestId = Number(person.id);
    }
  }
  if (!newPerson.id) {
    newPerson.id = String(highestId + 1);
  }
  people.push(newPerson);
  return savePeople(people);
}

export function editPerson(id, changes) {
  const people = loadFamily();
  let personToEdit = null;
  for (const person of people) {
    if (person.id === id) {
      personToEdit = person;
    }
  }
  for (const key in changes) {
    personToEdit[key] = changes[key];
  }
  return savePeople(people);
}

export function removePerson(id) {
  const people = loadFamily();
  const remainingPeople = [];
  for (const person of people) {
    if (person.id !== id) {
      remainingPeople.push(person);
    }
  }
  return savePeople(remainingPeople);
}