type IDamerauResponse = {
  relative: number;
  similarity: number;
  steps: number;
};

type IAutocompleteResponse = {
  name: string;
  value: string;
};

/* eslint-disable id-length, @typescript-eslint/no-confusing-non-null-assertion */

/**
 * @param a - The first string to compare
 * @param b - The second string to compare
 * @returns The Damerau-Levenshtein distance between the two strings
 */
function damerau(a: string, b: string): IDamerauResponse {
  if (a.length === 0) return { steps: b.length, relative: 1, similarity: 0 };
  if (b.length === 0) return { steps: a.length, relative: 1, similarity: 0 };

  const matrix: number[][] = [];

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

function quickSort(arr: string[], left: number, right: number, query: string) {
  if (left >= right) return;

  const pivot = arr[Math.floor((left + right) / 2)];
  let i = left;
  let j = right;

  while (i <= j) {
    while (damerau(arr[i]!, query).relative < damerau(pivot!, query).relative) {
      i++;
    }

    while (damerau(arr[j]!, query).relative > damerau(pivot!, query).relative) {
      j--;
    }

    if (i <= j) {
      const temp = arr[i];
      arr[i] = arr[j]!;
      arr[j] = temp!;
      i++;
      j--;
    }
  }

  quickSort(arr, left, j, query);
  quickSort(arr, i, right, query);
}

/* eslint-enable id-length */

/**
 * @param query - The query to autocomplete
 * @param choices - The choices to autocomplete from
 * @returns The autocompleted choices in an array of objects
 */
export function damerAutocomplete(query: string, choices: readonly string[]): IAutocompleteResponse[] {
  if (!choices) return [];

  const levChoices = [];

  for (const choice of choices) {
    const index = choice.indexOf(":");
    if (index >= 0) {
      const levChoice = choice
        .slice(Math.max(0, index + 2))
        .trim()
        .toLowerCase();
      levChoices.push(levChoice);
    }
  }

  const filtered = levChoices.filter((choice) => {
    const lev: IDamerauResponse = damerau(choice, query);
    if (query.length > 2) return lev.relative <= 0.75;
    else if (query.length > 1) return lev.relative <= 0.8;
    else return lev.relative <= 1;
  });

  const sorted = [...filtered];
  quickSort(sorted, 0, sorted.length - 1, query);

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
