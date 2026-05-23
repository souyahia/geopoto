import * as z from "zod";

interface ParseWithSchemaParams<Schema extends z.ZodType> {
  schema: Schema;
  source: string;
  value: unknown;
}

export function parseWithSchema<Schema extends z.ZodType>({
  schema,
  source,
  value,
}: ParseWithSchemaParams<Schema>): z.output<Schema> {
  const result = schema.safeParse(value);

  if (result.success) {
    return result.data;
  }

  throw new Error(`Invalid ${source} data:\n${z.prettifyError(result.error)}`);
}
