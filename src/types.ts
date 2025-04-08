import { z } from 'zod';

export type ZodDynamooseMeta = {
  hashKey?: boolean;
  rangeKey?: boolean;
  index?: {
    name: string;
    type: 'global' | 'local';
  };
  required?: boolean;
};

declare module 'zod' {
  interface ZodType<
    Output = any,
    Def extends z.ZodTypeDef = z.ZodTypeDef,
    Input = Output
  > {
    dynamoose(meta: ZodDynamooseMeta): this;
  }

  interface ZodObject<
    T extends z.ZodRawShape = z.ZodRawShape,
    UnknownKeys extends z.UnknownKeysParam = z.UnknownKeysParam,
    Catchall extends z.ZodTypeAny = z.ZodTypeAny
  > {
    toDynamoose(): import('dynamoose/dist/Schema').SchemaDefinition;
  }
}
