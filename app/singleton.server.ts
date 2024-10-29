// app/singleton.server.ts

// Since the dev server re-requires the bundle, do some shenanigans to make
// certain things persist across that 🔄
// Borrowed/modified from https://github.com/jenseng/abuse-the-platform/blob/main/app/utils/singleton.ts

export const singleton = <Value>(
  name: string,
  valueFactory: () => Value,
): Value => {
  const g = global as unknown as { __singletons: Record<string, unknown> };

  // Initialize the __singletons object if it doesn't exist
  g.__singletons ??= {};

  // Attempt to create or retrieve the singleton instance
  try {
    g.__singletons[name] ??= valueFactory();
  } catch (error) {
    throw new Error(`Failed to initialize singleton "${name}": ${error}`);
  }

  return g.__singletons[name] as Value;
};
