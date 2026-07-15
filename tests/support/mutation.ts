export const mutationEnabled = (): boolean =>
  process.env.RUN_MUTATION_TESTS?.toLowerCase() === 'true';

export const mutationSkipReason =
  'Set RUN_MUTATION_TESTS=true to enable tests that change server data.';
