interface IDamerauResponse {
  steps: number;
  relative: number;
  similarity: number;
}

interface IAutocompleteResponse {
  name: string;
  value: string;
}

function damerau(a: string, b: string): IDamerauResponse {
  if (a.length === 0) return { steps: b.length, relative: 1, similarity: 0 };
  if (b.length === 0) return { steps: a.length, relative: 1, similarity: 0 };

  const matrix: Array<number>[] = [];

  let i: number;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  let j: number;
  for (j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j]! = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(matrix[i - 1]![j - 1]! + 1, Math.min(matrix[i]![j - 1]! + 1, matrix[i - 1]![j]! + 1));
      }
    }

    if (i > 1 && j > 1 && b.charAt(i - 1) === a.charAt(j - 2) && b.charAt(i - 2) === a.charAt(j - 1)) {
      matrix[i]![j] = Math.min(matrix[i]![j]!, matrix[i - 2]![j - 2]! + 1);
    }
  }

  const steps = matrix[b.length]![a.length] ?? 0;
  const relative = steps / Math.max(a.length, b.length) ?? 0;
  const similarity = 1 - relative ?? 0;

  return { steps, relative, similarity };
}

export function damerAutocomplete(query: string, choices: readonly string[]): IAutocompleteResponse[] {
  if (!choices) return [];

  let levChoices = [];

  for (const choice of choices) {
    const index = choice.indexOf(":");
    if (index >= 0) {
      const levChoice = choice
        .substring(index + 2)
        .trim()
        .toLowerCase();
      levChoices.push(levChoice);
    }
  }

  const filtered = levChoices.filter((choice) => {
    let lev: IDamerauResponse = damerau(choice, query);
    if (query.length > 2) return lev.relative <= 0.75;
    else if (query.length > 1) return lev.relative <= 0.8;
    else return lev.relative <= 1;
  });

  const sorted = filtered.sort((a, b) => {
    let levA: IDamerauResponse = damerau(a, query);
    let levB: IDamerauResponse = damerau(b, query);

    return levA.relative - levB.relative;
  });

  const finalChoices = [];
  for (const choice of sorted) {
    const index = levChoices.indexOf(choice);
    if (index !== -1) {
      const selectedChoice = choices[index];
      if (selectedChoice && selectedChoice.length > 0) {
        finalChoices.push(selectedChoice);
      }
    }
  }

  let response = [];

  for (const choice of finalChoices) {
    response.push({ name: choice, value: choice });
  }

  if (response.length >= 15) {
    response = response.slice(0, 15);
  }

  return response;
}
