# dynamoose-zod

Type-safe Dynamoose schema generation from [Zod](https://github.com/colinhacks/zod).  
Easily build and validate your models with Zod, then convert them into Dynamoose schemas.

## ✨ Features

- Add Dynamoose metadata to your Zod schemas
- Convert Zod schemas into `dynamoose.SchemaDefinition`
- Supports:
  - `hashKey`, `rangeKey`
  - `index`
  - `optional()` and `nullable()`
  - `ZodObject`, `ZodArray`, nested objects
- Fully typed `.dynamoose()` and `.toDynamoose()` helpers

## 📦 Installation

```bash
npm install dynamoose-zod zod dynamoose
# or
yarn add dynamoose-zod zod dynamoose
```

## 🚀 Getting Started

```ts
import { z } from 'zod';
import { extendZodWithDynamoose } from 'dynamoose-zod';
import * as dynamoose from 'dynamoose';

extendZodWithDynamoose(z);

const ZUserSchema = z.object({
  id: z.string().dynamoose({ hashKey: true }),
  email: z.string(),
  name: z.string().nullable().optional(),
  createdAt: z.string(),
});

const UserSchema = new dynamoose.Schema(ZUserSchema.toDynamoose());
```

## 🧩 Zod Metadata Extensions

You can attach Dynamoose metadata directly to any Zod type using `.dynamoose()`:

```ts
z.string().dynamoose({ hashKey: true });
z.string().dynamoose({ rangeKey: true });
z.string().dynamoose({
  index: { name: 'my_index', type: 'global' },
});
```

Supports use with `.nullable()` and `.optional()`:

```ts
z.string().nullable().optional().dynamoose({ required: false });
```

## 🔍 Supported Zod Types

| Zod Type            | Dynamoose Support |
|---------------------|-------------------|
| `z.string()`         | ✅ `String`        |
| `z.number()`         | ✅ `Number`        |
| `z.boolean()`        | ✅ `Boolean`       |
| `z.array()`          | ✅ `Array`         |
| `z.object()`         | ✅ `Object`        |
| `nullable()` / `optional()` | ✅ `required: false` or `type: [X, NULL]` |

## 📘 API Reference

### `extendZodWithDynamoose(z: typeof zod)`

Extends Zod with:

- `.dynamoose(meta: ZodDynamooseMeta)` on all types
- `.toDynamoose()` on `z.object()`

### `ZodDynamooseMeta`

```ts
type ZodDynamooseMeta = {
  hashKey?: boolean;
  rangeKey?: boolean;
  index?: {
    name: string;
    type: 'global' | 'local';
  };
  required?: boolean;
};
```

## 📄 License

MIT © 2025 Bruno Agutoli <br>
[@agutoli](https://github.com/agutoli)

---

Made with ❤️ using [Zod](https://github.com/colinhacks/zod) + [Dynamoose](https://dynamoosejs.com/)
