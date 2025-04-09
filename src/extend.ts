import {
  z,
  ZodTypeAny,
  ZodObject,
  ZodArray,
  ZodOptional,
  ZodNullable,
} from "zod";
import type { SchemaDefinition } from "dynamoose/dist/Schema";
import type { ZodDynamooseMeta } from "./types";

function extractMeta(zodType: ZodTypeAny): ZodDynamooseMeta {
  try {
    const desc = zodType.description;
    if (!desc) return {};
    const parsed = JSON.parse(desc);
    return parsed.dynamoose ?? {};
  } catch {
    return {};
  }
}

function parseZodType(
  zodType: ZodTypeAny,
  dynamoose: typeof import("dynamoose")
): any {
  const baseType = zodType._def?.typeName;
  const meta = extractMeta(zodType);
  let baseParsed: any;

  switch (baseType) {
    case "ZodString":
      baseParsed = String;
      break;
    case "ZodNumber":
      baseParsed = Number;
      break;
    case "ZodBoolean":
      baseParsed = Boolean;
      break;
    case "ZodArray":
      baseParsed = {
        type: Array,
        schema: [parseZodType((zodType as ZodArray<any>).element, dynamoose)],
      };
      break;
    case "ZodObject":
      baseParsed = {
        type: Object,
        schema: zodToDynamoose(zodType as ZodObject<any>, dynamoose),
      };
      break;
    case "ZodOptional":
    case "ZodNullable": {
      const inner = (zodType as ZodOptional<any> | ZodNullable<any>).unwrap();
      const parsed = parseZodType(inner, dynamoose);
      return {
        ...(typeof parsed === "object" ? parsed : { type: parsed }),
        required: false,
      };
    }
    default:
      baseParsed = String;
  }

  if (typeof baseParsed === "object") return { ...baseParsed, ...meta };
  return Object.keys(meta).length > 0
    ? { type: baseParsed, ...meta }
    : baseParsed;
}

export function zodToDynamoose(
  schema: ZodObject<any>,
  dynamoose: typeof import("dynamoose")
): SchemaDefinition {
  const shape = schema.shape;
  const result: SchemaDefinition = {};

  for (const key in shape) {
    result[key] = parseZodType(shape[key], dynamoose);
  }

  return result;
}

export function extendZodWithDynamoose(
  zod: typeof z,
  dynamoose: typeof import("dynamoose")
) {
  if (!zod || !dynamoose) {
    throw new Error("Zod and Dynamoose must be provided");
  }

  (zod.ZodType.prototype as any).dynamoose = function (
    this: ZodTypeAny,
    meta: ZodDynamooseMeta
  ): ZodTypeAny {
    const current = this.description ? JSON.parse(this.description) : {};

    const extended = {
      ...current,
      dynamoose: {
        ...(current.dynamoose ?? {}),
        ...meta,
      },
    };

    return this.describe(JSON.stringify(extended));
  };

  (zod.ZodObject.prototype as any).toDynamoose = function () {
    return zodToDynamoose(this, dynamoose);
  };
}
